# pantryPlus

Manage your shopping lists, and then some.

## Branches
* `main`
    - serves as the trunk for the repo; this is the source of truth
    - contains the latest code, including potentially breaking changes
    - create feature branches from here
    - these should be tagged with a version via Github releases feature before publishing
* feature branch(es)
    - create these from `main` for the purpose of developing specific features
    - PR/merge to `main` only when feature is complete enough to share
    - name feature branch w/ enough context to convey intent

## Dependencies
* [AWS](https://aws.amazon.com/)
    - for various cloud services (e.g., MySQL RDS, Cognito)
* [Node.js](https://nodejs.org/)
    - must be installed locally to run the React-Native Expo server
* [Typescript](https://www.typescriptlang.org/)
    - for static typing
* [React Native](https://reactnative.dev/)
    - a framework for building native apps using React-like syntax
* [Expo](https://expo.dev/)
    - for managing development workflows and debug builds
* [EAS](https://expo.dev/accounts/askewsoft/projects/pantryplus)
    - for managing builds and releases in the cloud
* [Amplify](https://docs.amplify.aws/start/getting-started/setup/q/integration/react-native/)
    - robust all-encompasing cloud service, but used only for prebuilt authentication UI in this project
* [Cocoapods](https://cocoapods.org/)
    - for managing iOS dependencies
    - `brew install cocoapods`
* [Xcode](https://developer.apple.com/xcode/)
    - for building the app for iOS devices
* [Maestro](https://maestro.dev/)
    - end-to-end testing framework that can grab screenshots of mobile simulators for regression testing

## Developing
### Native projects (CNG)
The **`ios/`** and **`android/`** directories are **not committed**. They are generated from **`app.json`**, **`package.json`**, and **config plugins** (see `plugins/`) whenever you run **`expo prebuild`**. EAS Build does the same in the cloud, so local and CI stay aligned with that config.

After a fresh clone or any change that affects native code (new Expo modules, `app.json` `ios` / `plugins`, etc.):

```sh
npm run prebuild
# or, to wipe and regenerate native folders from scratch:
npm run prebuild:clean
```

The Podfile **`fmt`** workaround for newer Xcode / Clang lives in **`plugins/withFmtPodfile.js`** and is applied automatically at prebuild time.

### Xcode Configuration
1. Install Xcode from the Mac App Store
1. Install the Xcode command line tools: `xcode-select --install`
1. Accept the Xcode license: `sudo xcodebuild -license`
1. Ensure you have a target device configured in Xcode
    - Open Xcode
    - Open `Settings` (⌘,)
    - Open `Accounts` tab
    - Click `+` and login with your Apple ID
    - Open `Locations` tab and ensure that `Command Line Tools` has the latest version selected
    - Open `Components` tab and if necessary, click the `+` button to install a simulator for the iOS version you wish to target
    - Close the settings

### Running the App Locally
We recommend that you use [nvm](https://nvm.sh) to manage different versions of node.js.
You can find the version of node used for this project in the `.nvmrc` file.

The app can be built for a variety of contexts. Builds can be **local** or **cloud-based**.

These can take a while to complete. You must have the iOS Simulator already running (**Xcode → Open Developer Tool → Simulator**), or use a connected device.

1. `nvm use` — switch to the correct Node.js version
1. `npm install` — install JavaScript dependencies
1. If you do not yet have an **`ios/`** folder (e.g. right after `git clone`), run **`npm run prebuild`** once (see [Native projects](#native-projects-cng))
1. `npm run ios` — generate native projects if needed, install pods, build, and run the dev client on the iOS Simulator (or device)
    - **NOTE:** If you add or upgrade **native** Expo packages, run **`npm run prebuild`** (or **`npm run prebuild:clean`**) and then **`npm run ios`**. **`npm start`** alone does not rebuild native code.

#### If build fails

- If **`ios/`** is missing or out of date:
    1. `npm run prebuild` (or `npm run prebuild:clean` if something looks corrupted)
    1. `npm run ios` again

- You may need to refresh CocoaPods:
    1. `cd ios`
    1. `pod install`
    1. `cd ..`
    1. `npm run ios` again

- If you continue to experience issues, you may need to:
    1. Ensure **`ios/`** exists (`npm run prebuild` if not)
    1. Open **Xcode**
    1. Open **`ios/pantryPlus.xcworkspace`** (workspace, not the `.xcodeproj` alone)
    1. Select the **pantryPlus** target under the project
    1. Open the **Build Settings** tab
    1. Ensure **Build Options → User Script Sandboxing** is set to **No**
    1. Close Xcode
    1. `npm run ios` again

## Build & Publish
These are compiled using the EAS (i.e., Expo Application Services) build service

1. Always first update version numbers using semantic versioning
These helper scripts will update both the `package.json` and the `app.json`
    ```sh
    # bug fixes
    npm run version:patch

    # OR

    # minor feature enhancements
    npm run version:minor
    ```
1. Github Tag & Release
1. Decide on [Native Publish](#native-publish) or [OTA Update](#ota-updates)

### Native Publish
To build the app for publishing to the Apple App Store or Test Flight, run:
- `npm run prod:ios`
- `npm run publish:ios`
- Create a release in Github with a semantic version (e.g., `v1.2.0`, note the prepended `v`)

#### Build Contexts
To build the app for a specific context use `--profile`; e.g., `eas build --platform ios --profile preview --clear-cache`. These relate to the [Update Channels](#update-channels)

The following other contexts are also supported:
- `preview` - preview build for testing
- `prod` - production build for release

### OTA Updates
pantryPlus uses EAS Updates to deploy minor changes "over the air" (OTA) without requiring a full app store submission. This allows for quick bug fixes and feature updates. The app uses `fingerprint` runtime version policy, which automatically detects native code changes.

#### Update Channels
These relate to the [Build Contexts](#build-contexts)
- `preview` - For testing updates before production
- `published` - For production updates to users

#### Publishing
**Note:** Always provide a clear, descriptive message for your updates. This message will be visible to users and helps with tracking what changes were deployed.

```sh
# Preview Testing:
npm run update:preview "Fix shopping list sorting issue"

# OR

# Production Release:
npm run update:prod "Add new category management features"
```

#### Important Notes
##### When Updates Are Allowed
- ✅ **JavaScript/TypeScript changes only** - UI logic, component behavior, styling
- ✅ **No new native dependencies** - No new packages or iOS-specific changes
- ✅ **Runtime version unchanged** - EAS automatically detects compatibility
- ✅ **Native app build is already installed** - Users must have installed from the App Store to receive OTA updates via EAS

##### When updates NOT allowed
- ❌ Updates are only available in production builds, not development builds
- ❌ New native packages or dependencies
- ❌ iOS-specific configuration changes
- ❌ Changes to native code or plugins
- ❌ Major version bumps (use full build instead)

##### Update Behavior
- Updates are automatically checked when the app starts
- Users can manually check for updates in Settings → Check for Updates
- Updates are applied immediately when available
- The app will restart to apply updates


## Documentation
- [Debugging Update Issues](docs/DEBUGGING_EAS_UPDATES.md)


## Helper Scripts
See **[./scripts/README.md](./scripts/README.md)** for more detail

```sh
# GET API TOKEN

    npm run gettoken <username> <password>

# EXPO UPDATES

    npm run update:preview "message"

    # OR

    npm run update:prod "message"

# VERSION MANAGEMENT

    npm run version:patch # (e.g., 1.4.0 → 1.4.1)

    # OR

    npm run version:minor # (e.g., 1.4.0 → 1.5.0)

# AUTOMATED TESTS

    npm run maestro:baseline

    # OR

    npm run maestro:current
```