import {
    ShoppersApi,
    Configuration
} from 'pantryPlusApiClient';

import cognitoConfig from '@/config/cognito';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { ShopperType } from '@/models/DomainStore';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const shopperApi = new ShoppersApi(configuration);

const registerUser = async () => {
    let authenticatedUser;
    let userAttributes;
    try {
        userAttributes = await fetchUserAttributes();
    } catch(error) {
        console.error('Unable to fetch user attributes:', error);
        throw error;
    }

    authenticatedUser = {
      email: userAttributes.email || '',
      id: userAttributes.sub || '',
      nickName: userAttributes.nickname || ''
    };

    try {
        await shopperApi.createShopper(authenticatedUser);
        return authenticatedUser;
    } catch(error) {
        console.error('Unable to create shopper:', error);
        throw error;
    }
};

export default {
    registerUser,
};