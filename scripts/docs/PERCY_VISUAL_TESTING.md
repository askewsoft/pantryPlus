# Percy Visual Testing Guide

## What is Percy?

Percy is a visual testing platform that captures screenshots of your app and compares them across builds to detect visual regressions. It helps ensure that UI changes don't break the visual appearance of your app.

## Why Visual Testing?

- **Catch visual bugs early**: Detect unintended visual changes before they reach users
- **Ensure consistency**: Verify that UI components look correct across different devices and screen sizes
- **Document UI changes**: Track how your app's appearance evolves over time
- **Confidence in refactoring**: Make UI changes with confidence that you haven't broken anything visually

## Setup

### Prerequisites

1. **Percy CLI** (already installed globally):
   ```bash
   npm install -g @percy/cli
   ```

2. **Percy Account**: 
   - Sign up at [percy.io](https://percy.io)
   - Create a new project for pantryPlus
   - Get your project token

3. **Environment Variable**:
   ```bash
   export PERCY_TOKEN=your_percy_project_token_here
   ```
   
   Add this to your shell profile (`.zshrc`, `.bashrc`, `.oh-my-zsh/custom/exports.zsh`, etc.) for persistence.
   Be sure to either open a new shell or run `exec zsh` in your existing shell to load the environment variable(s).

### Configuration

The project includes a `.percy.js` configuration file that sets up:
- Mobile viewport sizes (iPhone SE, iPhone 12 Pro Max)
- Device pixel ratios for different screen densities
- Screenshot naming conventions
- Elements to ignore during comparison
- Custom CSS for consistent rendering

## Usage

### Simple Testing (Recommended)

1. **Start your app**:
   ```bash
   npm start
   ```

2. **Run visual testing**:
   ```bash
   npm run percy
   ```

3. **Follow the prompts** to navigate to each screen and capture screenshots

The script will:
- Detect your iOS Simulator device automatically
- Guide you through each screen with clear instructions
- Capture screenshots with the correct device specifications
- Direct you to the Percy dashboard when complete

### Manual Testing (Advanced)

For manual control, you can still use individual commands:
```bash
node scripts/percy-test.js custom "My Custom Screen"
```

## Testing Strategy

### Key Screens to Test

1. **Authentication Flow**:
   - Login screen
   - Sign up screen
   - Password reset screen

2. **Main App Screens**:
   - Home/Dashboard
   - Shopping lists (empty, with items, editing)
   - Item details
   - Categories
   - Settings

3. **Edge Cases**:
   - Empty states
   - Loading states
   - Error states
   - Long content (many items in a list)

### Naming Convention

Use descriptive names that indicate the screen and state:
- `Home Screen - Empty State`
- `Shopping List - With Items`
- `Settings - Profile Tab`
- `Error - Network Unavailable`

### Testing Different States

For each screen, consider testing:
- **Empty state**: No data loaded
- **Loading state**: Data being fetched
- **Populated state**: Normal data display
- **Error state**: Error messages shown
- **Editing state**: User interaction modes

### Handling Dynamic Data

The Percy configuration automatically ignores common dynamic elements like:
- List names, category names, item names
- User-specific content (names, emails)
- Timestamps and dates
- Loading states and spinners
- Counts and totals

**To add new dynamic elements to ignore:**
1. Add `data-testid` attributes to your components
2. Update the `ignore` array in `.percy.js`

**Example:**
```jsx
<Text data-testid="list-name">{list.name}</Text>
<Text data-testid="item-count">{itemCount} items</Text>
```

### Updating Snapshots for Intentional Changes

When you make intentional UI changes:

1. **Run your Percy tests** to capture new screenshots
2. **Review changes** in the Percy dashboard
3. **Approve intentional changes** by clicking "Approve"
4. **Reject unintended regressions** by clicking "Reject"

**For major UI redesigns:**
- Delete old snapshots from the Percy dashboard
- Run tests again to create new baseline snapshots

## Integration with Development Workflow

### Before Committing Changes

1. Run your app and navigate through key screens
2. Capture screenshots of any changed screens
3. Review the Percy dashboard for visual changes
4. Approve or reject changes as needed

### Example Workflow

```bash
# Start development
npm start

# Make your changes...

# Test visual changes using helper script
npm run percy:all
# or for specific screens
node scripts/percy-test.js shopping-list
node scripts/percy-test.js custom "Updated Shopping List UI"

# Check Percy dashboard for results
# Commit changes if visual tests pass
```

### Configuration Files

The project includes several configuration files:

#### `percy-config.json`
Contains all screens to test, device specifications, and prompts:
- **Screens**: List of all screens with descriptions and navigation prompts
- **Device Specs**: iPhone dimensions and pixel ratios
- **Dashboard URL**: Link to Percy dashboard

#### `.percy.js`
Percy-specific configuration for visual testing:
- Elements to ignore during comparison
- Custom CSS for consistent rendering
- Screenshot naming conventions

### Screen Discovery

The project includes a screen discovery script that can automatically find screens in your codebase:

```bash
node scripts/generate-screens.js
```

This script:
- Analyzes navigation files to find screens
- Discovers screen components in the `src/screens` directory
- Updates `percy-config.json` with new screens
- Preserves existing customizations

### Screen Inventory

For a comprehensive list of all screens and the `data-testid` attributes needed, see [Percy Screen Testing Guide](PERCY_SCREENS.md).

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure your app is running (`npm start`)
   - Check the URL is correct
   - Verify the port number (usually 8081)

2. **Screenshots Not Capturing**:
   - Make sure you're on the correct screen in your app
   - Wait for the screen to fully load
   - Check that the screen is visible (not behind other apps)

3. **Inconsistent Results**:
   - Use the same device/simulator for consistent testing
   - Ensure the app is in the same state (logged in, same data, etc.)
   - Check that dynamic content is consistent

### Debug Mode

Run Percy with debug logging:
```bash
DEBUG=percy:* percy screenshot --name "Debug Test" --url "exp://localhost:8081"
```

## Best Practices

1. **Consistent Environment**: Always test on the same device/simulator
2. **Clean State**: Start with a fresh app state for each test
3. **Descriptive Names**: Use clear, descriptive names for screenshots
4. **Regular Testing**: Run visual tests regularly, not just before releases
5. **Document Changes**: Update this guide when adding new screens or workflows

## Resources

- [Percy Documentation](https://docs.percy.io/)
- [Percy CLI Reference](https://docs.percy.io/docs/cli)
- [Visual Testing Best Practices](https://docs.percy.io/docs/visual-testing-best-practices) 