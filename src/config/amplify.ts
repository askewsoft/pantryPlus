import type { ResourcesConfig } from "aws-amplify";
import cognitoConfig from '@/config/cognito';
import appConfig from '@/config/app';

// Check for required environment variables
const missingVars = [];
if (!cognitoConfig.userPoolId) missingVars.push('EXPO_PUBLIC_USER_POOL_ID');
if (!cognitoConfig.userPoolClientId) missingVars.push('EXPO_PUBLIC_APP_CLIENT_ID');
if (!cognitoConfig.userPoolRegion) missingVars.push('EXPO_PUBLIC_REGION');
if (!appConfig.apiUrl) missingVars.push('EXPO_PUBLIC_API_URL');

if (missingVars.length > 0) {
  throw new Error(`Required environment variables are not set: ${missingVars.join(', ')}`);
}

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolClientId,
      identityPoolId: "",
      region: cognitoConfig.userPoolRegion,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
        nickname: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
};

if (appConfig.debug) {
  console.log('Amplify Config:', {
    userPoolId: amplifyConfig.Auth.Cognito.userPoolId,
    userPoolClientId: amplifyConfig.Auth.Cognito.userPoolClientId,
    region: amplifyConfig.Auth.Cognito.region,
  });
}

export default amplifyConfig as ResourcesConfig;