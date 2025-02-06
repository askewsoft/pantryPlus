import {
    ShoppersApi,
    Shopper,
    Configuration,
    List,
    Group,
    Location,
} from 'pantryPlusApiClient';

import cognitoConfig from '@/config/cognito';
import { fetchUserAttributes } from 'aws-amplify/auth';
import logging from '@/config/logging';

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
      nickname: userAttributes?.nickname || ''
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
    const xAuthUser = user?.email!;
    const shopperId = user?.id!;
    try {
        const listsData = await shopperApi.getLists(xAuthUser, shopperId);
        return listsData.data;
    } catch (error) {
        console.error('Unable to get user lists:', error);
        return [];
    }
};

const getUserGroups = async ({ user }: { user: Shopper }): Promise<Array<Group>> => {
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

const getUserInvites = async ({ user }: { user: Shopper }): Promise<Array<Group>> => {
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        const invitesData = await shopperApi.getInvites(xAuthUser, shopperId);
        return invitesData.data;
    } catch (error) {
        console.error('Unable to get user invites:', error);
        return [];
    }
};

const getUserLocations = async ({ user }: { user: Shopper }): Promise<Array<Location>> => {
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        const locationsData = await shopperApi.getLocations(xAuthUser, shopperId);
        return locationsData.data;
    } catch (error) {
        console.error('Unable to get user locations:', error);
        return [];
    }
};

const acceptInvite = async ({ xAuthUser, shopperId, inviteId }: { xAuthUser: string, shopperId: string, inviteId: string }): Promise<void> => {
    try {
        await shopperApi.acceptInvite(xAuthUser, shopperId, inviteId);
    } catch (error) {
        console.error('Unable to accept invite:', error);
    }
};

const declineInvite = async ({ xAuthUser, shopperId, inviteId }: { xAuthUser: string, shopperId: string, inviteId: string }): Promise<void> => {
    try {
        await shopperApi.declineInvite(xAuthUser, shopperId, inviteId);
    } catch (error) {
        console.error('Unable to decline invite:', error);
    }
};

const getShopper = async ({ shopperId, xAuthUser }: { shopperId: string, xAuthUser: string }): Promise<Shopper> => {
    try {
        const shopperData = await shopperApi.retrieveShopper(xAuthUser, shopperId);
        return shopperData.data;
    } catch (error) {
        console.error('Unable to get shopper:', error);
        return {} as Shopper;
    }
};

export default {
    registerUser,
    getUserLists,
    getUserGroups,
    getUserInvites,
    getUserLocations,
    acceptInvite,
    declineInvite,
    getShopper
};