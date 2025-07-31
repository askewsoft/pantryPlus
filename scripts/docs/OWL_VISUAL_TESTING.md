# React Native Owl Visual Testing Guide

pantryPlus uses React Native Owl for visual regression testing to ensure UI changes don't break the app's appearance.

## Intro

React Native Owl is a lightweight visual regression testing tool specifically designed for React Native applications. It captures screenshots of your app and compares them against baseline images to detect unintended visual changes.

## Quick Start

### Prerequisites
- React Native app running in iOS Simulator
- Node.js and npm installed
- Install React Native Owl
   ```bash
   npm install --save-dev react-native-owl
   ```
## Usage

### Interactive Testing
1. Run the owl script
   ```bash
   npm run owl
   ```
1. **Choose your testing mode**:
   - **Capture baseline screenshots**: For new screens or after UI changes
   - **Run visual regression tests**: Compare against existing baseline
   - **Both**: Capture and test in one session

1. **Follow the prompts** to navigate to each screen and capture screenshots

1. **Review results** in the `screenshots/` directory

### Manual Commands
For advanced users, you can run React Native Owl commands directly:

```bash
# Capture a single screenshot
npx react-native-owl capture --test-id home-screen --device iPhone 14

# Run visual regression tests
npx react-native-owl test --baseline ./screenshots/baseline --output ./screenshots/output

# Update baseline images
npx react-native-owl update-baseline --input ./screenshots/output
```

## Configuration

The visual testing configuration is in `owl.config.js`:

### Device Specifications
```javascript
devices: {
  'iPhone 14': {
    width: 393,
    height: 852,
    devicePixelRatio: 3,
  },
  // ... more devices
}
```

### Test Scenarios
```javascript
scenarios: [
  {
    name: 'Home Screen - My Lists',
    description: 'Main lists screen showing user\'s shopping lists',
    testID: 'home-screen',
    device: 'iPhone 14',
  },
  // ... more scenarios
]
```

### Ignored Elements
Elements with these `testID` values will be ignored during comparison:
```javascript
ignoreElements: [
  'timestamp',
  'date',
  'user-name',
  'list-name',
  // ... more dynamic elements
]
```

## Adding testID Attributes

To make your components testable, add `testID` props to key elements:

```jsx
// Good - specific and descriptive
<View testID="home-screen">
  <Text testID="list-name">{list.name}</Text>
  <Text testID="item-count">{items.length} items</Text>
</View>

// Avoid - too generic
<View testID="container">
  <Text testID="text">{content}</Text>
</View>
```

## File Structure

```
screenshots/
├── baseline/          # Reference images
├── output/           # Test results and diffs
└── temp/            # Temporary files
```

## Best Practices

### 1. Consistent Test Data
- Use the same test data for baseline and comparison runs
- Consider using mock data or test fixtures

### 2. Stable UI State
- Wait for loading states to complete
- Ensure animations have finished
- Avoid capturing during transitions

### 3. Meaningful testIDs
- Use descriptive, specific testIDs
- Follow a consistent naming convention
- Include screen context in testID names

### 4. Regular Updates
- Update baseline images when making intentional UI changes
- Review and approve visual differences regularly
- Keep baseline images in version control

## Troubleshooting

### Common Issues

**Screenshots not capturing**
- Ensure the app is running and visible
- Check that testID attributes are present
- Verify device specifications match your simulator

**False positive differences**
- Check for dynamic content (timestamps, user data)
- Add problematic elements to `ignoreElements` list
- Ensure consistent test data

**Performance issues**
- Reduce the number of scenarios if needed
- Use lower resolution devices for faster testing
- Consider running tests in parallel

### Getting Help
- Check the [React Native Owl documentation](https://github.com/FormidableLabs/react-native-owl)
- Review the configuration in `owl.config.js`
- Check the `screenshots/output/` directory for detailed test results

## Integration with Development Workflow

### Before Committing
1. Run visual tests: `npm run owl`
2. Review any differences
3. Update baseline if changes are intentional
4. Commit baseline images with your changes