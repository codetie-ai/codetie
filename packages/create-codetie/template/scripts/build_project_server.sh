#!/bin/bash

# Get the project name from the first argument
PROJECT_NAME=$1

# Remove .xcodeproj extension if present
PROJECT_NAME=${PROJECT_NAME%.xcodeproj}

# Set the output directory
BUILD_DIR="$(pwd)/build"

# Ensure the project file exists
if [ ! -f "${PROJECT_NAME}.xcodeproj/project.pbxproj" ]; then
    echo "Error: ${PROJECT_NAME}.xcodeproj not found in the current directory."
    exit 1
fi

# Configure xcode-build-server
xcode-build-server config -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}"

# Build the project for iOS Simulator and generate build log
xcodebuild -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}" \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=iPhone 14,OS=latest" \
    -derivedDataPath "${BUILD_DIR}" \
    -resultBundlePath .bundle \
    clean build | tee build.log

# Parse the build log with xcode-build-server
xcode-build-server parse -a build.log

# Check if the build was successful
if [ $? -eq 0 ]; then
    APP_PATH="${BUILD_DIR}/Build/Products/Debug-iphonesimulator/${PROJECT_NAME}.app"
    if [ -d "$APP_PATH" ]; then
        echo "✅ Project built successfully!"
        echo "App bundle location: $APP_PATH"
        # Export the APP_PATH for use in run_simulator.sh
        echo "export APP_PATH=\"$APP_PATH\"" > build_output.sh
    else
        echo "❌ Build succeeded, but app bundle not found at expected location."
        exit 1
    fi
else
    echo "❌ Project build failed."
    exit 1
fi