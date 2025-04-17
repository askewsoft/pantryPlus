# pantryPlus

Manage your shopping lists, and then some.

## Branches
* `main`
    - serves as the trunk for the repo; this is the source of truth
    - contains the latest code, including potentially breaking changes
    - create feature branches from here
* `dev`
    - PR into this branch from `main` only
* `prod`
    - PR into this branch from `dev` only
    - publicly available "production" builds
    - these should be tagged with a version via Github releases feature
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
* [XCode](https://developer.apple.com/xcode/)
    - for building the app for iOS devices

## Run
We recommend that you use [nvm](https://nvm.sh) to manage different versions of node.js.
You can find the version of node used for this project in the `.nvmrc` file.
Follow these steps to get the project running:

1. `nvm use` - Switch to the correct node.js version
1. `npm install` to get all dependencies
1. `npm start` to run the react-native expo server
1. Follow the on-screen instructions to open the app on your iOS or Android device's Expo Go app.

## Developing
### XCode Configuration
1. Install XCode from the Mac App Store
1. Install the Xcode command line tools: `xcode-select --install`
1. Accept the Xcode license: `sudo xcodebuild -license`
1. Ensure you have a target device configured in XCode
    - Open XCode
    - Open `Settings` (⌘,)
    - Open `Accounts` tab
    - Click `+` and login with your Apple ID
    - Open `Locations` tab and ensure that `Command Line Tools` has the latest version selected
    - Open `Components` tab and if necessary, click the `+` button to install a simulator for the iOS version you wish to target
    - Close the settings

### Running the app
The app can be built for a variety of contexts. Builds can be **local** or **cloud-based**.

#### Local builds
- these can take a while to complete
- have the iOS emulator already running (XCode -> Open Developer Tool -> Simulator)
- `npm run ios` to build and run the app for your iOS device emulator
    - **NOTE** if you install new expo packages, you need to build the app using this command, `npm start` will not work
- If this fails, you may need to:
    - `cd ios`
    - `pod install`
    - `cd ..`
    - `npm run ios` again
- If you continue to experience issues, you may need to:
    - open XCode
    - open the pantryPlus project from `./ios/pantryPlus.xcworkspace`
    - select the "Target" from below the project name
    - click on the "Build Settings" tab along the top
    - ensure that the `> Build Options > User Scripting Sandbox` setting is set to `No`
    - you may close XCode at this point
    - `npm run ios` again

#### Cloud builds
- these are compiled using the EAS (i.e., Expo Application Services) build service
- the following contexts are supported:
    - `dev-simulator` - development on an iOS simulator
    - `dev-ios` - development on an iOS device
    - `preview` - preview build for testing
    - `production` - production build for release
- to build the app for a specific context use `--profile`; e.g., `eas build --platform ios --profile preview --clear-cache`.
