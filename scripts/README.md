# Scripts
These are for debugging, testing, and OTA updates

## get bearer token
Use this to get an Authorization token (aka, access token) to use in a curl request to the pantry plus API.
You'll need to have registered a user account in the pantry plus mobile app, which integrates with AWS Cognito.
Then replace `<username>` and `<password>` with your pantry plus mobile app / cognito credentials

**NEVER STORE CREDENTIALS IN THE REPO**

From the root of the repo, execute the following

```sh
# Convenient npm script (recommended)
npm run gettoken <username> <password>

# Or direct command
npx ts-node scripts/get-token.ts <username> <password>
```

Then use the token in a curl command like the following (this is just an example, not to be used verbatim):

```sh
curl -v "https://api.askewsoft.com/v1/shoppers" -H "Authorization: Bearer <copy auth token here>" -H "Content-Type: application/json" -d '{"id": "FB0A3A06-6222-41A7-8E80-9DA1ABD9C4AB", "nickname": "Tester", "email": "tester@my-domain-name.com"}'
```

## version management

Use these scripts to update version numbers in both `package.json` and `app.json` files. This ensures consistency between the two files and follows semantic versioning principles.

```sh
# Convenient npm scripts (recommended)
npm run version:patch  # Increment patch version (1.4.0 → 1.4.1)
npm run version:minor  # Increment minor version (1.4.0 → 1.5.0)
```

**What these scripts do:**
- Read current version from `package.json`
- Calculate new version based on semantic versioning rules
- Update both `package.json` and `app.json` files
- Provide clear feedback about what was updated

## expo update

Use this to publish over-the-air updates to EAS and end users when no native code has been modified. Called from the root of this repo.

```sh
# Convenient npm scripts (recommended)
npm run update:preview "Your update message"
npm run update:prod "Your update message"

# Or direct command
npm run expoupdate <command> <message>
# Examples:
npm run expoupdate preview "Fix shopping list sorting"
npm run expoupdate prod "Add new category features"
```

- **command** — one of the designated channels from `./eas.json` (i.e., `prod` or `preview`)
- **message** — summary of the changes included in this build/update for display to end users

## visual testing

React Native Owl is used for visual regression testing to ensure UI changes don't break the app's appearance. See [Owl Visual Testing Guide](docs/OWL_VISUAL_TESTING.md) for complete setup and usage instructions

```sh
# Interactive visual testing (recommended)
npm run owl

# Or direct command
node scripts/owl-test.js
```

### Adding TestIDs
To make your components testable, add `testID` attributes to data-driven elements. See [TestID Implementation Guide](docs/TESTID_GUIDE.md) for detailed recommendations.
