#!/bin/bash

# Authentication test functions for Maestro
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

# Run auth suite (logout -> login)
run_auth_suite() {
    maestro test -e SCREENSHOT_DIR=$SCREENSHOT_DIR -e TEST_USER_EMAIL=$TEST_USER_EMAIL -e TEST_USER_PASSWORD=$TEST_USER_PASSWORD tests/auth/logout.yaml tests/auth/login.yaml
    print_success "Auth suite completed"
}