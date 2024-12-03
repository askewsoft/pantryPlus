import {
    ShoppersApi,
    Configuration
} from 'pantryPlusApiClient';

import cognitoConfig from '@/config/cognito';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { UserType } from '@/stores/DomainStore';
import { ListModel } from '@/stores/models/List';

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

const getUserLists = async ({ user }: { user: UserType }) => {
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        // TODO: consider moving the ListModel creation to the called API
        const listData = await shopperApi.getLists(xAuthUser, shopperId);
        const lists = listData.data.map(
            (list) => {
                const { id, name, ownerId } = list;
                const userIsOwner = ownerId === shopperId;
                return ListModel.create({ id, name, userIsOwner });
            }
        );
        return lists;
    } catch (error) {
        console.error('Unable to get user lists:', error);
        // TODO: do we ignore the error vs throw?
        throw error;
    }
};

export default {
    registerUser,
    getUserLists,
};