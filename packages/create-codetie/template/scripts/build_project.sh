#!/bin/bash

# Get the project name from the first argument
PROJECT_NAME=$1

# Remove .xcodeproj extension if present
PROJECT_NAME=${PROJECT_NAME%.xcodeproj}

# Set the output directory
BUILD_DIR="$(pwd)/build"

# Set simulator details
SIMULATOR_NAME="iPhone 15 Pro"
SIMULATOR_OS="17.0"  # Updated to a more likely iOS version

# Get the latest iOS runtime
RUNTIME=$(xcrun simctl list runtimes | grep iOS | tail -1 | awk '{print $NF}')

# Get the device type
DEVICE_TYPE=$(xcrun simctl list devicetypes | grep "$DEVICE" | tail -1 | awk '{print $NF}')

if [ -z "$RUNTIME" ] || [ -z "$DEVICE_TYPE" ]; then
    echo "Could not determine runtime or device type for $DEVICE"
    exit 1
fi

# Ensure the project file exists
if [ ! -f "${PROJECT_NAME}.xcodeproj/project.pbxproj" ]; then
    echo "Error: ${PROJECT_NAME}.xcodeproj not found in the current directory."
    exit 1
fi


# Check if the simulator already exists
if ! xcrun simctl list devices | grep -q "$SIMULATOR_NAME"; then
  echo "Creating $SIMULATOR_NAME simulator..."
  xcrun simctl create "$SIMULATOR_NAME" "$SIMULATOR_NAME" "$RUNTIME"
else
  echo "$SIMULATOR_NAME simulator already exists."
fi

# Build the project for iOS Simulator
# echo "Building ${PROJECT_NAME} for iOS Simulator..."
# xcodebuild -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}" \
#     -configuration Debug \
#     -sdk iphonesimulator \
#     -destination "platform=iOS Simulator,name=${SIMULATOR_NAME},OS=${SIMULATOR_OS}" \
#     -derivedDataPath "${BUILD_DIR}" \
#     -allowProvisioningUpdates \
#     CODE_SIGN_STYLE=Automatic \
#     DEVELOPMENT_TEAM="3G79D9D34R" \
#     clean build

xcodebuild -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}" \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=${SIMULATOR_NAME}" \
    -derivedDataPath "${BUILD_DIR}" \
    ONLY_ACTIVE_ARCH=YES \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    clean build

# xcodebuild -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}" \
#     -configuration Debug \
#     -destination "platform=iOS Simulator,name=${SIMULATOR_NAME},OS=${SIMULATOR_OS}" \
#     -derivedDataPath "${BUILD_DIR}" \
#     ONLY_ACTIVE_ARCH=YES \
#     CODE_SIGN_IDENTITY="" \
#     CODE_SIGNING_REQUIRED=NO \
#     CODE_SIGNING_ALLOWED=NO \
#     clean build    

# xcodebuild -project "${PROJECT_NAME}.xcodeproj" -scheme "${PROJECT_NAME}" \
#     -configuration Debug \
#     -destination "platform=iOS Simulator,name=iPhone 14,OS=latest" \
#     -derivedDataPath "${BUILD_DIR}" \
#     -verbose \
#     ONLY_ACTIVE_ARCH=YES \
#     DEVELOPMENT_TEAM="" \
#     CODE_SIGN_IDENTITY="" \
#     CODE_SIGNING_REQUIRED=NO \
#     CODE_SIGNING_ALLOWED=NO \
#     clean build

# xcodebuild -project "app_w_xcode.xcodeproj" -scheme "app_w_xcode" \
#     -configuration Debug \
#     -destination "platform=iOS Simulator,name=iPhone 15" \
#     -derivedDataPath "/Users/kevin/projects/swift/testing-codetie/app_w_xcode/build" \
#     -verbose \
#     ONLY_ACTIVE_ARCH=YES \
#     DEVELOPMENT_TEAM="" \
#     CODE_SIGN_IDENTITY="" \
#     CODE_SIGNING_REQUIRED=NO \
#     CODE_SIGNING_ALLOWED=NO \
#     clean build

# CONFIGURATION_BUILD_DIR="${BUILD_DIR}/Build/Products/Debug-iphonesimulator" \    

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