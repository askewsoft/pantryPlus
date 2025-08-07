#!/bin/bash

# Maestro Test Runner Script
# This script helps run Maestro tests and manage screenshots
# Uses modular helper scripts for better organization

set -e

# Source all helper scripts
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/test-helpers/common.sh"
source "$SCRIPT_DIR/test-helpers/auth-tests.sh"
source "$SCRIPT_DIR/test-helpers/list-tests.sh"
source "$SCRIPT_DIR/test-helpers/location-tests.sh"
source "$SCRIPT_DIR/test-helpers/group-tests.sh"
source "$SCRIPT_DIR/test-helpers/cleanup-tests.sh"
source "$SCRIPT_DIR/test-helpers/screenshot-utils.sh"

# Run all tests
run_all_tests() {
    print_status "RUNNING ALL TESTS"
    run_auth_suite
    
    # Run other test suites in proper order
    run_list_suite
    # run_location_suite
    # run_group_suite
    
    print_success "ALL TESTS COMPLETED"
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
    echo "  test <file>         Run a specific test file"
    echo "  auth                Run auth suite (logout -> login)"
    echo "  login               Run login test only"
    echo "  logout              Run logout test only"
    echo "  lists               Run all list tests"
    echo "  list <name>         Run specific list test (e.g., create-list)"
    echo "  locations           Run all location tests"
    echo "  location <name>     Run specific location test"
    echo "  groups              Run all group tests"
    echo "  group <name>        Run specific group test"
    echo "  cleanup             Run cleanup tests"
    echo "  all                 Run all tests"
    echo "  compare             Compare current vs baseline screenshots"
    echo "  promote             Promote current screenshots to baseline"
    echo "  clear               Clear current screenshots"
    echo "  clear-baseline      Clear baseline screenshots"
    echo "  list-screenshots    List available screenshots"
    echo "  setup               Setup directories"
    echo "  help                Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 test tests/auth/login.yaml"
    echo "  $0 auth"
    echo "  $0 list create-list"
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
        "lists")
            run_list_suite
            ;;
        "locations")
            run_location_suite
            ;;
        "groups")
            run_group_suite
            ;;
        "cleanup")
            run_cleanup_suite
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
        "clear-baseline")
            clear_baseline
            ;;
        "list-screenshots")
            list_screenshots
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
