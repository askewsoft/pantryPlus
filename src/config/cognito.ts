import appConfig from './app';

const {
    EXPO_PUBLIC_USER_POOL_ID,
    EXPO_PUBLIC_APP_CLIENT_ID,
    EXPO_PUBLIC_REGION
} = process.env;

type CognitoConfig = {
    userPoolId: string;
    userPoolClientId: string;
    userPoolRegion: string;
}

const cognitoConfig: CognitoConfig = {
    userPoolId: EXPO_PUBLIC_USER_POOL_ID!,
    userPoolClientId: EXPO_PUBLIC_APP_CLIENT_ID!,
    userPoolRegion: EXPO_PUBLIC_REGION!
}

if (appConfig.debug) console.log('Cognito Config = ', cognitoConfig);
export default cognitoConfig as CognitoConfig;