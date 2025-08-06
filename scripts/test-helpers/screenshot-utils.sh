#!/bin/bash

# Screenshot utility functions for Maestro tests
# This file should be sourced by the main test script

# Source common functions
# SCRIPT_DIR is set by the main script
source "$SCRIPT_DIR/test-helpers/common.sh"

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

# Clear baseline screenshots
clear_baseline() {
    print_status "Clearing baseline screenshots..."
    rm -rf screenshots/baseline/*
    print_success "Baseline screenshots cleared"
}

# List available screenshots
list_screenshots() {
    print_status "Current screenshots:"
    if [ -z "$(ls -A screenshots/current)" ]; then
        print_warning "No current screenshots found"
    else
        ls -la screenshots/current/
    fi
    
    echo ""
    print_status "Baseline screenshots:"
    if [ -z "$(ls -A screenshots/baseline)" ]; then
        print_warning "No baseline screenshots found"
    else
        ls -la screenshots/baseline/
    fi
} 