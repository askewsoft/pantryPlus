import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";
import cognitoConfig from '@/config/cognito';

if (!cognitoConfig.userPoolId || !cognitoConfig.userPoolClientId) {
  throw new Error("Required environment variables are not set");
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

export default amplifyConfig as ResourcesConfig;