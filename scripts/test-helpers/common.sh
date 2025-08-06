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

# Run a specific test with common parameters
run_maestro_test() {
    local test_file=$1
    local description=${2:-"test"}

    print_status "Running $description: $test_file"

    if [ ! -f "$test_file" ]; then
        print_error "Test file not found: $test_file"
        exit 1
    fi

    # Run Maestro test with screenshot directory and auth parameters
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR -e TEST_USER_EMAIL=$TEST_USER_EMAIL -e TEST_USER_PASSWORD=$TEST_USER_PASSWORD $test_file
    print_success "$description completed: $test_file"
}

# Run multiple tests in sequence
run_test_suite() {
    local test_files=("$@")
    local suite_name=${test_files[0]}
    
    print_status "Running test suite: $suite_name"
    
    for test_file in "${test_files[@]:1}"; do
        run_maestro_test "$test_file" "test"
    done
    
    print_success "Test suite completed: $suite_name"
} 