# pantryPlus

Manage your shopping lists, and then some.

## Run
This project relies on XCode, node, typescript, react, and expo.
Ensure you have the correct version of [node.js](https://nodejs.org/) installed.
We also recommend that you use [nvm](https://nvm.sh) to manage different versions.

Once these are installed, follow these steps to get the project running:

1. `nvm use` - Switch to the correct node.js version
1. `npm install` to get all dependencies
1. `npm start` to run the project
1. Follow the on-screen instructions to open the app on your iOS or Android device's Expo Go app.

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
* [AWS](https://aws.amazon.com/) - for various cloud services (e.g., MySQL RDS, Cognito)
* [React Native](https://reactnative.dev/)
* [Expo](https://expo.dev/)
* [EAS](https://expo.dev/accounts/askewsoft/projects/pantryplus) - for managing builds, releases, etc.
