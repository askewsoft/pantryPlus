#!/bin/bash

# Version management script
# Updates both package.json and app.json with semantic versioning

set -e  # Exit on any error

# Function to show usage
show_usage() {
    echo "Usage: $0 [patch|minor]"
    echo ""
    echo "Commands:"
    echo "  patch  - Increment patch version (1.4.0 → 1.4.1)"
    echo "  minor  - Increment minor version (1.4.0 → 1.5.0)"
    echo ""
    echo "Examples:"
    echo "  $0 patch"
    echo "  $0 minor"
    echo ""
    echo "Or use npm scripts:"
    echo "  npm run version:patch"
    echo "  npm run version:minor"
}

# Check if command argument is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: No command specified"
    show_usage
    exit 1
fi

COMMAND=$1

# Validate command
if [ "$COMMAND" != "patch" ] && [ "$COMMAND" != "minor" ]; then
    echo "❌ Error: Invalid command '$COMMAND'"
    show_usage
    exit 1
fi

echo "🔧 Updating $COMMAND version..."

# Read current version from package.json
CURRENT_VERSION=$(node -e "console.log(require('../package.json').version)")
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
fi

# Update package.json
node -e "
const fs = require('fs');
const pkg = require('../package.json');
pkg.version = '$NEW_VERSION';
fs.writeFileSync('../package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Updated package.json to version $NEW_VERSION');
"

# Update app.json
node -e "
const fs = require('fs');
const app = require('../app.json');
app.expo.version = '$NEW_VERSION';
fs.writeFileSync('../app.json', JSON.stringify(app, null, 2));
console.log('✅ Updated app.json to version $NEW_VERSION');
"

echo "🎉 Version updated successfully to $NEW_VERSION"
echo "Files updated: package.json, app.json"
