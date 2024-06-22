#!/bin/bash

# Log Collector
(
    # Define source and target file paths
    SOURCE_DIR="$(realpath $(dirname $0))"
    SCRIPT_NAME="log_collector.sh"
    SERVICE_NAME="log_collector.service"
    WHITELIST_FILE="path_whitelist"

    TARGET_SCRIPT_PATH="/usr/local/bin/$SCRIPT_NAME"
    TARGET_SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"

    CONFIGURATION_DIR="/etc/network_dashboard"

    # Make sure that the service working directory exist
    WORKING_DIR="/var/log/network_dashboard"
    echo "Create working directory $WORKING_DIR"
    sudo mkdir -p "$WORKING_DIR"

    # Copy the script to /usr/local/bin and make it executable
    echo "Copying $SCRIPT_NAME to $TARGET_SCRIPT_PATH"
    sudo cp "$SOURCE_DIR/$SCRIPT_NAME" "$TARGET_SCRIPT_PATH"
    sudo chmod +x "$TARGET_SCRIPT_PATH"

    # Copy the service file to /etc/systemd/system
    echo "Copying $SERVICE_NAME to $TARGET_SERVICE_PATH"
    sudo cp "$SOURCE_DIR/$SERVICE_NAME" "$TARGET_SERVICE_PATH"

    # Copy the whitelist file to configuration dir
    echo "Copying $WHITELIST_FILE TO $CONFIGURATION_DIR"
    sudo mkdir -p "$CONFIGURATION_DIR"
    sudo cp "$SOURCE_DIR/$WHITELIST_FILE" "$CONFIGURATION_DIR"

    # Reload systemd daemon to recognize the new service
    echo "Reloading systemd daemon"
    sudo systemctl daemon-reload

    # Stop the service if it were active
    echo "Stopping $SERVICE_NAME"
    sudo systemctl stop "$SERVICE_NAME"

    # Enable the service to start on boot
    echo "Enabling $SERVICE_NAME"
    sudo systemctl enable "$SERVICE_NAME"

    # Start the service immediately
    echo "Starting $SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"

    # Check the status of the service
    service_status=$(systemctl is-active "$SERVICE_NAME")
    echo "Service status: $service_status"

    echo "Installation complete. Service $SERVICE_NAME is now running."

    # Follow the service logs
    journalctl -f -u "$SERVICE_NAME"
)