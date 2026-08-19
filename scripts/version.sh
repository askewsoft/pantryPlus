#!/bin/bash

# Version management script
# Updates package.json, app.json, and regenerates native iOS files so the
# About screen (CFBundleShortVersionString) matches the new version.

set -e  # Exit on any error

# Function to show usage
show_usage() {
    echo "Usage: $0 [patch|minor|major]"
    echo ""
    echo "Commands:"
    echo "  patch  - Increment patch version (1.4.0 → 1.4.1)"
    echo "  minor  - Increment minor version (1.4.0 → 1.5.0)"
    echo "  major  - Increment major version (1.4.0 → 2.0.0)"
    echo ""
    echo "Examples:"
    echo "  $0 patch"
    echo "  $0 minor"
    echo "  $0 major"
    echo ""
    echo "Or use npm scripts:"
    echo "  npm run version:patch"
    echo "  npm run version:minor"
    echo "  npm run version:major"
}

# Check if command argument is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: No command specified"
    show_usage
    exit 1
fi

COMMAND=$1

# Validate command
if [ "$COMMAND" != "patch" ] && [ "$COMMAND" != "minor" ] && [ "$COMMAND" != "major" ]; then
    echo "❌ Error: Invalid command '$COMMAND'"
    show_usage
    exit 1
fi

echo "🔧 Updating $COMMAND version..."

# Read current version from package.json
CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")
echo "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Calculate new version based on command
if [ "$COMMAND" = "patch" ]; then
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
    echo "New version: $NEW_VERSION (patch increment)"
elif [ "$COMMAND" = "minor" ]; then
    NEW_MINOR=$((MINOR + 1))
    NEW_VERSION="$MAJOR.$NEW_MINOR.0"
    echo "New version: $NEW_VERSION (minor increment, patch reset to 0)"
elif [ "$COMMAND" = "major" ]; then
    NEW_MAJOR=$((MAJOR + 1))
    NEW_VERSION="$NEW_MAJOR.0.0"
    echo "New version: $NEW_VERSION (major increment, minor and patch reset to 0)"
fi

# Update package.json
node -e "
const fs = require('fs');
const pkg = require('./package.json');
pkg.version = '$NEW_VERSION';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Updated package.json to version $NEW_VERSION');
"

# Update app.json
node -e "
const fs = require('fs');
const app = require('./app.json');
app.expo.version = '$NEW_VERSION';
fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
console.log('✅ Updated app.json to version $NEW_VERSION');
"

# Ensure package-lock.json is in sync with package.json
echo "📦 Running npm install to sync package-lock.json..."
npm install
echo "✅ package-lock.json synchronized"

# Bake the new version into the generated native project (gitignored ios/).
# npm run ios reuses ios/ when it already exists, so About would keep showing
# the previous CFBundleShortVersionString without this step.
echo "🔨 Regenerating native iOS project so the app version is baked in..."
npm run prebuild
echo "✅ Native iOS project updated to version $NEW_VERSION"

echo "🎉 Version updated successfully to $NEW_VERSION"
echo "Files updated: package.json, app.json, package-lock.json, ios/"
echo "Next: npm run ios  (to install the rebuilt app on the simulator)"
