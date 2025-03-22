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

Then use the token in a curl command like the following (this is just an example, not to be used verbatim):

```sh
curl -v "https://api.askewsoft.com/v1/shoppers" -H "Authorization: Bearer <copy auth token here>" -H "Content-Type: application/json" -d '{"id": "FB0A3A06-6222-41A7-8E80-9DA1ABD9C4AB", "nickname": "Tester", "email": "tester@my-domain-name.com"}'
```
