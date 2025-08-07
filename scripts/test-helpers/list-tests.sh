#!/bin/bash

# List test functions for Maestro
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

# Run all list tests
run_list_suite() {
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR tests/lists/create-list.yaml
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR tests/lists/add-list-category.yaml
    print_success "List test suite completed"
}