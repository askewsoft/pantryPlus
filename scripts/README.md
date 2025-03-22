## Scripts
These are for debugging and testing

### get-tokens
Use this to get an Authorization token (aka, access token) to use in a curl request to the pantry plus API.
You'll need to have registered a user account in the pantry plus mobile app, which integrates with AWS Cognito.
Then replace `<username>` and `<password>` with your pantry plus mobile app / cognito credentials

**NEVER STORE CREDENTIALS IN THE REPO**

From the command line, execute the following

```sh
npx ts-node get-token.ts <username> <password>
```
