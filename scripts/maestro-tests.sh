#!/bin/bash

# Maestro Test Runner Script
# This script helps run Maestro tests and manage screenshots

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default screenshot directory
SCREENSHOT_DIR="current"

# Load environment variables from .env file if it exists
load_env() {
    if [ -f ".env" ]; then
        print_status "Loading environment variables from .env file..."
        export $(grep -v '^#' .env | xargs)
        print_success "Environment variables loaded"
    else
        print_warning "No .env file found. Create one from .env.example for test credentials."
    fi
}

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
    print_status "Setting up directories..."
    mkdir -p screenshots/current
    mkdir -p screenshots/baseline
    print_success "Directories ready"
}

# Run a specific test
run_test() {
    local test_file=$1

    print_status "Running test: $test_file"

    if [ ! -f "$test_file" ]; then
        print_error "Test file not found: $test_file"
        exit 1
    fi

    # Run Maestro test with screenshot directory and auth parameters
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR -e TEST_USER_EMAIL=$TEST_USER_EMAIL -e TEST_USER_PASSWORD=$TEST_USER_PASSWORD $test_file
    print_success "Test completed: $test_file"
}

# Run auth suite (logout -> login)
run_auth_suite() {
    print_status "Running auth suite..."
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR -e TEST_USER_EMAIL=$TEST_USER_EMAIL -e TEST_USER_PASSWORD=$TEST_USER_PASSWORD tests/auth/logout.yaml tests/auth/login.yaml
    print_success "Auth suite completed"
}

# Run all tests
run_all_tests() {
    print_status "Running all tests..."
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR tests/
    print_success "All tests completed"
}

# Compare current vs baseline screenshots
compare_screenshots() {
    print_status "Comparing screenshots..."
    if [ -z "$(ls -A screenshots/current)" ]; then
        print_warning "No current screenshots found. Run tests first."
        return
    fi

    if [ -z "$(ls -A screenshots/baseline)" ]; then
        print_warning "No baseline screenshots found. Consider promoting current screenshots to baseline."
        return
    fi

    print_status "Use Kaleidoscope to compare:"
    echo "screenshots/baseline vs screenshots/current"
}

# Promote current screenshots to baseline
promote_screenshots() {
    print_status "Promoting current screenshots to baseline..."
    if [ -z "$(ls -A screenshots/current)" ]; then
        print_warning "No current screenshots to promote"
        return
    fi

    cp -r screenshots/current/* screenshots/baseline/
    print_success "Screenshots promoted to baseline"
}

# Clear current screenshots
clear_current() {
    print_status "Clearing current screenshots..."
    rm -rf screenshots/current/*
    print_success "Current screenshots cleared"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --screenshots)
                if [[ -n "$2" && "$2" != --* ]]; then
                    if [[ "$2" == "baseline" || "$2" == "current" ]]; then
                        SCREENSHOT_DIR="$2"
                        shift 2
                    else
                        print_error "Invalid screenshot directory: $2. Use 'baseline' or 'current'"
                        exit 1
                    fi
                else
                    print_error "--screenshots requires a value (baseline or current)"
                    exit 1
                fi
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                # Store remaining arguments for main function
                REMAINING_ARGS+=("$1")
                shift
                ;;
        esac
    done
}

# Show help
show_help() {
    echo "Maestro Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Options:"
    echo "  --screenshots <dir>  Specify screenshot directory: 'baseline' or 'current' (default: current)"
    echo "  --help, -h          Show this help"
    echo ""
    echo "Commands:"
echo "  test <file>     Run a specific test file"
echo "  auth            Run auth suite (logout -> login)"
echo "  all             Run all tests"
echo "  compare         Compare current vs baseline screenshots"
echo "  promote         Promote current screenshots to baseline"
echo "  clear           Clear current screenshots"
echo "  setup           Setup directories"
echo "  help            Show this help"
    echo ""
    echo "Examples:"
echo "  $0 test tests/auth/login.yaml"
echo "  $0 auth"
echo "  $0 --screenshots baseline auth"
echo "  $0 --screenshots current all"
echo "  $0 compare"
}

# Main script logic
main() {
    check_maestro
    load_env
    setup_directories

    case "${REMAINING_ARGS[0]:-help}" in
        "test")
            if [ -z "${REMAINING_ARGS[1]}" ]; then
                print_error "Please specify a test file"
                exit 1
            fi
            run_test "${REMAINING_ARGS[1]}"
            ;;
        "auth")
            run_auth_suite
            ;;
        "all")
            run_all_tests
            ;;
        "compare")
            compare_screenshots
            ;;
        "promote")
            promote_screenshots
            ;;
        "clear")
            clear_current
            ;;
        "setup")
            setup_directories
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Initialize array for remaining arguments
REMAINING_ARGS=()

# Parse arguments first
parse_args "$@"

# Run main function with remaining arguments
main "${REMAINING_ARGS[@]}"
