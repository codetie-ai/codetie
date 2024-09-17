#!/bin/bash

# Get the project name from the first argument or use a default
PROJECT_NAME=${1:-{{PROJECT_NAME}}}

# Build the project without code signing
xcodebuild -project ${PROJECT_NAME}.xcodeproj -scheme ${PROJECT_NAME} \
    -configuration Debug \
    DEVELOPMENT_TEAM="" \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    clean build

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Project built successfully!"
else
    echo "❌ Project build failed."
    exit 1
fi