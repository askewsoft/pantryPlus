import appConfig from './app';

const cognitoConfig = {
    userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
    userPoolClientId: process.env.EXPO_PUBLIC_APP_CLIENT_ID,
    userPoolRegion: process.env.EXPO_PUBLIC_REGION
} as const;

type CognitoConfig = typeof cognitoConfig;

if (appConfig.debug) console.log('Cognito Config = ', cognitoConfig);
export default cognitoConfig;