# Maestro Tests for PantryPlus

This directory contains automated UI tests using Maestro for the PantryPlus app.

## Setup

1. **Install Maestro CLI** (if not already installed):
   ```bash
   brew install maestro
   ```

2. **Verify installation**:
   ```bash
   maestro --version
   ```

## Directory Structure

```
tests/
├── README.md                           # This file
├── grocery-list-navigation.yaml        # Test: Navigate to Grocery list
└── [future test files...]

screenshots/
├── current/                            # Screenshots from current test runs
└── baseline/                           # Approved/reference screenshots
```

## Running Tests

### Using the Helper Script

The easiest way to run tests is using the helper script:


## Screenshot Workflow

1. **Run tests** to generate current screenshots
2. **Review screenshots** in `screenshots/current/`
3. **Compare with baseline** using Kaleidoscope or similar tool
4. **Promote approved screenshots** to baseline
5. **Reject defective screenshots** by not promoting them

### Using Kaleidoscope for Comparison

```bash
# Open Kaleidoscope to compare folders
ksdiff screenshots/baseline screenshots/current
```

## Test Files

### Creating New Tests

1. Create a new `.yaml` file in the `tests/` directory
2. Follow the Maestro syntax and structure
3. Use descriptive names for test files
4. Include appropriate assertions and screenshots
5. Document the test purpose in comments

### Example Test Structure

```yaml
appId: pantryplus
name: Test Name
tags:
  - category1
  - category2

---
- launchApp
- assertVisible: "Expected Text"
- tapOn: "Button Text"
- takeScreenshot: "screenshot-name"
```

### Recording Tests

You can record tests interactively:

```bash
maestro record tests/new-test.yaml
```

This will open the app and let you perform actions that will be recorded as test steps.
