import {
    ShoppersApi,
    Shopper,
    Configuration,
    List,
    PickGroupIdOrNameOrOwnerId_
} from 'pantryPlusApiClient';

import cognitoConfig from '@/config/cognito';
import { fetchUserAttributes } from 'aws-amplify/auth';

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
        return;
    }

    authenticatedUser = {
      email: userAttributes?.email || '',
      id: userAttributes?.sub || '',
      nickName: userAttributes?.nickname || ''
    };

    try {
        await shopperApi.createShopper(authenticatedUser);
        return authenticatedUser;
    } catch(error) {
        console.error('Unable to create shopper:', error);
        return;
    }
};

const getUserLists = async ({ user }: { user: Shopper }): Promise<Array<List>> => {
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        const listsData = await shopperApi.getLists(xAuthUser, shopperId);
        return listsData.data;
    } catch (error) {
        console.error('Unable to get user lists:', error);
        return [];
    }
};

const getUserGroups = async ({ user }: { user: Shopper }): Promise<Array<PickGroupIdOrNameOrOwnerId_>> => {
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        const groupsData = await shopperApi.getGroups(xAuthUser, shopperId);
        return groupsData.data;
    } catch (error) {
        console.error('Unable to get user groups:', error);
        return [];
    }
};

export default {
    registerUser,
    getUserLists,
    getUserGroups
};