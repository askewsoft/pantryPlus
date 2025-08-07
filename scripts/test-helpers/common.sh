#!/bin/bash

# Common functions and utilities for Maestro test scripts
# This file should be sourced by other test scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default screenshot directory
SCREENSHOT_DIR="current"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables from .env file if it exists
load_env() {
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
        print_success "Environment variables loaded"
    else
        print_warning "No .env file found. Create one from .env.example for test credentials."
    fi
}

# Check if Maestro is installed
check_maestro() {
    if ! command -v maestro &> /dev/null; then
        print_error "Maestro CLI is not installed. Please install it first:"
        echo "brew install maestro"
        exit 1
    fi
    print_success "Maestro CLI found"
}

# Create directories if they don't exist
setup_directories() {
    mkdir -p screenshots/current
    mkdir -p screenshots/baseline
    print_success "Directories ready"
}