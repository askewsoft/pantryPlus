# Debugging EAS Updates

This guide helps troubleshoot issues with EAS (Expo Application Services) updates not being detected by your app.

## Quick Diagnosis

### In the App (Settings → About)
Check these key values:
- **Runtime Version**: This is the "fingerprint" that must match for updates to work
- **Update Channel**: Should match the channel you published to (preview/published)
- **Update ID**: Current update identifier

### Via Command Line
```bash
# List all builds (including TestFlight/App Store)
eas build:list

# List all updates
eas update:list

# Get detailed info about a specific build
eas build:view <build-id>

# Get detailed info about a specific update
eas update:view <update-id>
```

## Common Issues & Solutions

### 1. Fingerprint Mismatch
**Symptoms**: Update published but app says "no updates available"
**Cause**: The update has a different runtime version than your installed app
**Solution**:
- Check the Runtime Version in Settings → About
- Compare with the runtime version in your EAS update
- They must match for updates to work

### 2. Channel Mismatch
**Symptoms**: Update exists but app can't see it
**Cause**: Update published to wrong channel (preview vs published)
**Solution**:
- Verify your app's Update Channel in Settings → About
- Ensure you published to the matching channel:
  - `npm run update:preview` → `preview` channel
  - `npm run update:prod` → `published` channel

### 3. Version Mismatch
**Symptoms**: Update compatibility errors
**Cause**: App version in code doesn't match installed app version
**Solution**:
- Check app version in Settings → About
- Compare with version in `app.json`
- Update version numbers before publishing if needed

### 4. Development Build Issues
**Symptoms**: Updates disabled or not working
**Cause**: Running a development build or development mode
**Solution**:
- Ensure you're running a production/preview build
- Check "Is Development Build" in Settings → About
- Updates only work in production builds, not development builds

## Understanding Runtime Versions

### What is a Runtime Version?
The runtime version (also called "fingerprint") is a unique identifier that EAS generates based on:
- Native dependencies and plugins
- Configuration files (`app.json`, `eas.json`)
- Build environment settings

### How Fingerprint Policy Works
Your app uses `"policy": "fingerprint"` in `app.json`, which means:
- EAS automatically detects when native code changes require a new build
- Updates must match the exact fingerprint of the installed app
- New fingerprints are generated when significant changes are detected

### When Fingerprints Change
Fingerprints typically change when:
- Adding/removing native dependencies
- Modifying iOS-specific configuration
- Changing build environment settings
- Major configuration changes

## Troubleshooting Workflow

### Step 1: Check App Status
1. Go to Settings → About
2. Note the Runtime Version and Update Channel
3. Verify Updates are Enabled and Allowed

### Step 2: Check EAS Dashboard
1. Go to [EAS Dashboard](https://expo.dev/accounts/askewsoft/projects/pantryplus)
2. Check the Updates tab for your published update
3. Note the runtime version and channel

### Step 3: Compare Values
- **Runtime Version**: Must match between app and update
- **Update Channel**: Must match between app and update
- **App Version**: Should be compatible

### Step 4: Identify the Issue
- **Mismatched fingerprint**: Update requires new app build
- **Wrong channel**: Republish to correct channel
- **Version issues**: Update version numbers and republish

## Advanced Debugging

### Check Update Logs
```bash
# View detailed update information
eas update:view <update-id>

# Check update status and metadata
eas update:list --limit 10
```

### Verify Build Compatibility
```bash
# Check build details
eas build:view <build-id>

# Compare build and update fingerprints
eas build:list --platform ios
eas update:list --channel published
```

### Force Update Check
In your app:
1. Go to Settings → Check for Updates
2. Wait for the check to complete
3. Note any error messages or status

## Prevention Tips

### Before Publishing Updates
1. ✅ Verify your app version is correct
2. ✅ Ensure you're publishing to the right channel
3. ✅ Test updates in preview channel first
4. ✅ Check that no native dependencies changed

### After Publishing Updates
1. ✅ Verify the update appears in the correct channel
2. ✅ Check that runtime versions match
3. ✅ Test the update detection in your app
4. ✅ Monitor update adoption rates

## Getting Help

If you're still having issues:
1. Check the [Expo documentation](https://docs.expo.dev/eas-update/)
2. Review the [EAS troubleshooting guide](https://docs.expo.dev/eas-update/troubleshooting/)
3. Check the [Expo Discord](https://discord.gg/expo) for community help
4. Review your project's [EAS dashboard](https://expo.dev/accounts/askewsoft/projects/pantryplus) for detailed logs
