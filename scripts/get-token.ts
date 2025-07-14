import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
import path from 'path';

// Try to load .env.preview from current directory and parent directory
const envPaths = [
    path.resolve(process.cwd(), '.env.preview'),
    path.resolve(process.cwd(), '..', '.env.preview')
];

// Required environment variables
const requiredVars = [
    'EXPO_PUBLIC_REGION',
    'EXPO_PUBLIC_USER_POOL_ID',
    'EXPO_PUBLIC_APP_CLIENT_ID'
];

// Try each path until we find one that works
let envFound = false;
for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });

    // Check if all required variables are present
    if (result.parsed) {
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        if (missingVars.length === 0) {
            envFound = true;
            break;
        }
    }
}

if (!envFound) {
    console.error('Could not find .env.preview file with all required variables');
    console.error('Please ensure your .env.preview file contains:');
    requiredVars.forEach(varName => console.error(`- ${varName}`));
    process.exit(1);
}

const REGION = process.env.EXPO_PUBLIC_REGION;
const USER_POOL_ID = process.env.EXPO_PUBLIC_USER_POOL_ID;
const CLIENT_ID = process.env.EXPO_PUBLIC_APP_CLIENT_ID;

// Get username and password from command line arguments
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.error('Usage: npx ts-node get-token.ts <username> <password>');
    process.exit(1);
}

async function getToken() {
    const client = new CognitoIdentityProviderClient({ region: REGION });

    try {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        });

        const response = await client.send(command);

        if (response.AuthenticationResult?.AccessToken) {
            console.log(response.AuthenticationResult.AccessToken);
        } else {
            console.error('No access token in response');
        }
    } catch (error: any) {
        console.error('Error getting token:', error);
        if (error.message?.includes('USER_PASSWORD_AUTH')) {
            console.error('\nTo fix this:');
            console.error('1. Go to AWS Console > Cognito > User Pools');
            console.error('2. Select your user pool');
            console.error('3. Go to "App integration" tab');
            console.error('4. Under "App clients and analytics", select your app client');
            console.error('5. Click "Edit" and enable "USER_PASSWORD_AUTH" under "Auth Flows Configuration"');
        }
    }
}

getToken();
