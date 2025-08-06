#!/bin/bash

# Group test functions for Maestro
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

# Run all group tests
run_group_suite() {
    # Run all group tests in proper order
    for test_file in tests/groups/*.yaml; do
        if [ -f "$test_file" ]; then
            run_maestro_test "$test_file" "group test"
        fi
    done
    
    print_success "Group test suite completed"
}