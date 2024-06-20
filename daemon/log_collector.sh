#!/bin/bash

# Define variables
SERVER_URL="http://127.0.0.1:49152"
LOG_DIR="/var/log/network_dashboard"
SYMLINK_DIR="${LOG_DIR}/symlink"
STATE_FILE="${LOG_DIR}/processed_files.state"
TMP_FOLDER="/tmp/network_dashboard"
WHITELIST_FILE="/etc/network_dashboard/path_whitelist"
INTERVAL=5

# Ensure the log dir exists
mkdir -p "$LOG_DIR"

# Ensure the tmp folder exists
mkdir -p "$TMP_FOLDER"

# Ensure the state file exists
touch "$STATE_FILE"

# Function to clean up TMP_FOLDER
clean_tmp() {
    if [ "$(ls -A $TMP_FOLDER)" ]; then
        rm "$TMP_FOLDER"/*
    fi
}

# Function to get the list of log files
get_log_files() {
    response=$(curl -s "$SERVER_URL/parser?option=raw")
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to fetch log files from server." >&2
        return 1
    fi 
    
    echo "$response" | jq -r '.[] | "\(.type)\t\(.lookups)"'
}

# Function to escape special characters in a string for use in a sed pattern
escape_sed() {
    echo "$1" | sed -e 's/[\/&]/\\&/g'
}

# Function to canonicalize a path
canonicalize_path() {
    local path="$1"
    # Remove trailing slashes
    path=$(echo "$path" | sed 's:/*$::')
    # Resolve the path to its absolute form
    realpath -m "$path"
}

# Function to check if a path is in the whitelist
is_path_whitelisted() {
    local path="$1"
    local canonical_path
    canonical_path=$(canonicalize_path "$path")

    while IFS= read -r whitelist_path || [[ -n "$whitelist_path" ]]; do
        whitelist_path=$(canonicalize_path "$whitelist_path")
        if [[ "$canonical_path" == "$whitelist_path" ]]; then
            return 0
        fi
    done < "$WHITELIST_FILE"

    return 1
}

# Function to split and post log entries
post_log_entries() {
    local log_type="$1"
    local log_file="$2"
    local temp_file="$3"
    local chunk_size=100 # Number of lines per chunk, adjust as needed

    split -l "$chunk_size" "$temp_file" "${TMP_FOLDER}/$(basename "$temp_file")_chunk_"

    for chunk in "${TMP_FOLDER}/$(basename "$temp_file")_chunk_"*; do
        local http_status last_line

        http_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: text/plain" --data-binary "@$chunk" "$SERVER_URL/log?type=$log_type")


        # Check if the POST request was successful
        if [[ "$http_status" -eq 200 ]]; then
            echo "$http_status: POSTed new entries of $log_type from $chunk"

            #Update the state file witih the new line number
            local last_line lines_posted
            last_line=$(grep -F "$log_file" "$STATE_FILE" 2>/dev/null | cut -d ' ' -f 2)
            last_line=${last_line:-0}

            lines_posted=$(wc -l < "$chunk")
            last_line=$((last_line + lines_posted))

            escaped_log_file=$(escape_sed "$log_file")
            sed -i "/^$escaped_log_file/d" "$STATE_FILE"
            echo "$log_file $last_line" >> "$STATE_FILE"
        else
            echo "$http_status: Failed to post log entries for $log_file from $chunk" >&2
            return 1
        fi

    done

    return 0
}

# Function to read and post new log entries
process_logs() {
    local log_type log_lookups log_file
    while IFS=$'\t' read -r log_type log_lookups; do
        unset log_file

        # Detect existing log file
        while read -r log_file; do
            if [ -f "$log_file" ]; then
                break
            fi
        done <<< "$(echo "$log_lookups" | jq -r '.[]')"

        mkdir -p "${SYMLINK_DIR}"
        SYMLINK="${SYMLINK_DIR}/${log_type}"

        # Ensure the log file exists
        if [[ ! -f "$log_file" && ! -e "$SYMLINK" ]]; then
            continue
        fi

        if [[ ! -e "$SYMLINK" ]]; then
            if is_path_whitelisted "$log_file"; then
                ln -s "$(realpath ${log_file})" "$SYMLINK"
            else 
                continue
            fi
        fi
        log_file="$SYMLINK"

        # Create a temporary file to store new log entries
        temp_file=$(mktemp -p "$TMP_FOLDER")

        # Get the last processed line number for this file
        last_line=$(grep -F "$log_file" "$STATE_FILE" 2>/dev/null | cut -d ' ' -f 2)
        last_line=${last_line:-0}

        # Get the current number of lines in the log file
        current_line_count=$(wc -l < "$log_file")

        # If last_line is greater than current_line_count, reset last_line to 0
        if [[ "$last_line" -gt "$current_line_count" ]]; then
            escaped_log_file=$(escape_sed "$log_file")
            sed -i "/^$escaped_log_file/d" "$STATE_FILE"
        fi

        # Extract new log entries
        tail -n +$((last_line + 1)) "$log_file" > "$temp_file"

        # Post new log entries if there are any
        if [[ -s "$temp_file" ]]; then
            post_log_entries "$log_type" "$log_file" "$temp_file"
        fi

        clean_tmp
    done
}

# Main loop
while true; do
    get_log_files | process_logs
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to process logs. Retrying in $INTERVAL seconds..." >&2
    fi
    sleep "${INTERVAL:-10}" # Adjust the interval as method
done