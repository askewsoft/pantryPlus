import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

const EXPO_PUBLIC_USER_POOL_ID = process.env.EXPO_PUBLIC_USER_POOL_ID;
const EXPO_PUBLIC_APP_CLIENT_ID = process.env.EXPO_PUBLIC_APP_CLIENT_ID;
const EXPO_PUBLIC_REGION = process.env.EXPO_PUBLIC_REGION;

if (!EXPO_PUBLIC_USER_POOL_ID || !EXPO_PUBLIC_APP_CLIENT_ID) {
  throw new Error("Required environment variables are not set");
}

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: EXPO_PUBLIC_USER_POOL_ID,
      userPoolClientId: EXPO_PUBLIC_APP_CLIENT_ID,
      identityPoolId: "",
      region: EXPO_PUBLIC_REGION,
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

export default amplifyConfig as ResourcesConfig;