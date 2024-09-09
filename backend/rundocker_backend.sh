#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to clean up resources
cleanup() {
    echo "Cleaning up..."
    docker rm -f bonfire-container 2>/dev/null || true
    docker rmi -f bonfire-image 2>/dev/null || true
}

# Set up the trap to call cleanup on interrupt (Ctrl+C)
trap cleanup INT

docker build --no-cache -t bonfire-image .
clear
echo -e "\033[0;32mImage built successfully\033[0m"
docker run -p 8080:8080 --name bonfire-container bonfire-image