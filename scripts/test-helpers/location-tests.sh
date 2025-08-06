#!/bin/bash

# Location test functions for Maestro
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

# Run all location tests
run_location_suite() {
    # Run all location tests in proper order
    for test_file in tests/locations/*.yaml; do
        if [ -f "$test_file" ]; then
            run_maestro_test "$test_file" "location test"
        fi
    done
    
    print_success "Location test suite completed"
}