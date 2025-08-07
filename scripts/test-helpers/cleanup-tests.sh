#!/bin/bash

# Cleanup test functions for Maestro
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

# Run cleanup tests
run_cleanup_suite() {
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR tests/cleanup/cleanup-test-data.yaml
    print_success "Cleanup test suite completed"
} 