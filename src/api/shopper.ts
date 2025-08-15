import {
    ShoppersApi,
    Shopper,
    List,
    Group,
    Location,
} from 'pantryplus-api-client/v2';

import { getApiConfiguration } from '@/services/SessionService';
import { fetchUserAttributes } from 'aws-amplify/auth';
import appConfig from '@/config/app';
import { AxiosError } from 'axios';

const registerUser = async () => {
    if (appConfig?.debug) {
        console.error(`appConfig?.debug = ${appConfig?.debug}`);
        console.error('Starting registerUser process');
    }
    const configuration = await getApiConfiguration();
    if (!configuration) {
        console.error('Failed to get API configuration');
        return;
    }

    if (appConfig?.debug) {
        console.error('API Configuration received:', {
            basePath: configuration.basePath,
            hasAccessToken: !!configuration.accessToken
        });
    }

    const shopperApi = new ShoppersApi(configuration);
    let authenticatedUser;
    let userAttributes;
    try {
        if (appConfig?.debug) console.error('Fetching user attributes...');
        userAttributes = await fetchUserAttributes();
    } catch(error) {
        console.error('Unable to fetch user attributes:', error);
        if (error instanceof Error) {
            console.error('User attributes error details:', error.message);
        }
        return;
    }

    authenticatedUser = {
      email: userAttributes?.email || '',
      id: userAttributes?.sub || '',
      nickname: userAttributes?.nickname || ''
    };

    if (appConfig?.debug) {
        console.error('Attempting to create shopper with:', {
            email: authenticatedUser.email,
            id: authenticatedUser.id,
            hasNickname: !!authenticatedUser.nickname
        });
    }

    try {
        const response = await shopperApi.createShopper(authenticatedUser);
        if (appConfig?.debug) {
            console.error('Shopper created successfully');
        }
        return authenticatedUser;
    } catch(error) {
        console.error('Unable to create shopper:', error);
        if (error instanceof AxiosError) {
            console.error('Network Error Details:', {
                message: error.message,
                code: error.code,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                }
            });
            // Add more detailed error logging
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Status:', error.response.status);
                console.error('Error Response Headers:', error.response.headers);
            }
        }
        return;
    }
};

const getUserLists = async ({ user }: { user: Shopper }): Promise<Array<List>> => {
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
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
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
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
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
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

const getRecentUserLocations = async ({ user, lookbackDays }: { user: Shopper, lookbackDays: number }): Promise<Array<Location>> => {
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
    const xAuthUser = user.email!;
    const shopperId = user.id!;
    try {
        const locationsData = await shopperApi.getLocations(xAuthUser, shopperId, lookbackDays);
        return locationsData.data;
    } catch (error) {
        console.error('Unable to get user locations:', error);
        return [];
    }
};

const acceptInvite = async ({ xAuthUser, shopperId, inviteId }: { xAuthUser: string, shopperId: string, inviteId: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
    try {
        await shopperApi.acceptInvite(xAuthUser, shopperId, inviteId);
    } catch (error) {
        console.error('Unable to accept invite:', error);
    }
};

const declineInvite = async ({ xAuthUser, shopperId, inviteId }: { xAuthUser: string, shopperId: string, inviteId: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
    try {
        await shopperApi.declineInvite(xAuthUser, shopperId, inviteId);
    } catch (error) {
        console.error('Unable to decline invite:', error);
    }
};

const getShopper = async ({ shopperId, xAuthUser }: { shopperId: string, xAuthUser: string }): Promise<Shopper> => {
    const configuration = await getApiConfiguration();
    const shopperApi = new ShoppersApi(configuration);
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
    getRecentUserLocations,
    acceptInvite,
    declineInvite,
    getShopper
};