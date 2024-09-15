#!/bin/bash

# generate.sh
# This script generates the Xcode project using XcodeGen based on the project.yml configuration file.

# Check if XcodeGen is installed
if ! command -v xcodegen &> /dev/null; then
    echo "Error: XcodeGen is not installed. Please install XcodeGen before running this script."
    echo "You can install XcodeGen using Homebrew: brew install xcodegen"
    exit 1
fi

# Generate the Xcode project
echo "Generating Xcode project using XcodeGen..."

xcodegen generate

# Check if the project generation was successful
if [ $? -eq 0 ]; then
    echo "Xcode project generated successfully."
else
    echo "Error: Failed to generate the Xcode project."
    exit 1
fi
