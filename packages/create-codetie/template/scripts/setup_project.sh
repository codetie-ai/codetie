#!/bin/bash

# setup_project.sh
# This script sets up project variables and updates configuration files.

echo "Select setup type:"
echo "1) Minimal"
echo "2) Advanced"
read -p "Enter choice [1 or 2]: " SETUP_TYPE

if [ "$SETUP_TYPE" == "1" ]; then
    echo "Performing minimal setup..."
elif [ "$SETUP_TYPE" == "2" ]; then
    echo "Performing advanced setup..."
else
    echo "Invalid choice. Exiting."
    exit 1
fi

# Prompt the user for variables
read -p "Enter Project Name [MyZunderApp]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-MyZunderApp}

read -p "Enter Bundle ID Prefix [com.zunderai]: " BUNDLE_ID_PREFIX
BUNDLE_ID_PREFIX=${BUNDLE_ID_PREFIX:-com.zunderai}

read -p "Enter Deployment Target iOS Version [17.0]: " DEPLOYMENT_TARGET
DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET:-17.0}

read -p "Enter Xcode Version [15.3]: " XCODE_VERSION
XCODE_VERSION=${XCODE_VERSION:-15.3}

read -p "Enter Swift Version [5.10.1]: " SWIFT_VERSION
SWIFT_VERSION=${SWIFT_VERSION:-5.10.1}

read -p "Enter App Version [1.0.0]: " APP_VERSION
APP_VERSION=${APP_VERSION:-1.0.0}

read -p "Enter Build Number [1]: " BUILD_NUMBER
BUILD_NUMBER=${BUILD_NUMBER:-1}

# Save variables to codetie.yml
cat > codetie.yml <<EOL
project_name: $PROJECT_NAME
bundle_id_prefix: $BUNDLE_ID_PREFIX
deployment_target: $DEPLOYMENT_TARGET
xcode_version: $XCODE_VERSION
swift_version: $SWIFT_VERSION
app_version: $APP_VERSION
build_number: $BUILD_NUMBER
EOL

# Update project.yml using yq (YAML processor)
if ! command -v yq &> /dev/null; then
    echo "The 'yq' command is required but not installed. Please install yq."
    exit 1
fi

# Update or create project.yml
if [ -f "project.yml" ]; then
    echo "Updating project.yml..."
else
    echo "Creating project.yml..."
    touch project.yml
fi

# Update project.yml with the variables
yq eval -i "
  .name = \"$PROJECT_NAME\" |
  .options.bundleIdPrefix = \"$BUNDLE_ID_PREFIX\" |
  .options.deploymentTarget.iOS = \"$DEPLOYMENT_TARGET\" |
  .options.xcodeVersion = \"$XCODE_VERSION\" |
  .targets.\"$PROJECT_NAME\".type = \"application\" |
  .targets.\"$PROJECT_NAME\".platform = \"iOS\" |
  .targets.\"$PROJECT_NAME\".sources = [\"$PROJECT_NAME\"] |
  .targets.\"$PROJECT_NAME\".settings.base.SWIFT_VERSION = \"$SWIFT_VERSION\" |
  .targets.\"$PROJECT_NAME\".info.properties.CFBundleShortVersionString = \"$APP_VERSION\" |
  .targets.\"$PROJECT_NAME\".info.properties.CFBundleVersion = \"$BUILD_NUMBER\" |
  .schemes.\"$PROJECT_NAME\".build.targets.\"$PROJECT_NAME\" = \"all\" |
  .schemes.\"$PROJECT_NAME\".run.config = \"Debug\"
" project.yml

echo "Project setup complete."
