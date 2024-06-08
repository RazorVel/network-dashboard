#!/bin/bash

# Start MongoDB service
systemctl start mongod
echo "MongoDB started successfully."

# Populate data
DATA_DIR=$(realpath './data')
FIELDS_PATH="${DATA_DIR:-'.'}/fields.init.js"
PARSERS_PATH="${DATA_DIR:-'.'}/parsers.init.js"
if [ -d "$DATA_DIR" ]; then
    for DATA_PATH in "$FIELDS_PATH" "$PARSERS_PATH"; do
        if [ -f "$DATA_PATH" ]; then
            node "$DATA_PATH" || false
        fi
        if [ $? -ne 0 ]; then
            populate_error="Data injection did not complete successfully"
            break
        fi
    done
    if [ -z "$populate_error" ]; then
        echo "Data injection completed..."
        rm -r "$DATA_DIR"
    else
        echo "$populate_error" 1>&2
    fi
fi

npm start