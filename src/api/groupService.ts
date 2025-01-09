import {
    GroupsApi,
    Shopper,
    Configuration,
    PickGroupIdOrNameOrOwnerId_
} from 'pantryPlusApiClient';

import cognitoConfig from '@/config/cognito';
import { randomUUID } from 'expo-crypto';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const groupApi = new GroupsApi(configuration);

const createGroup = async ({ name, xAuthUser }: { name: string, xAuthUser: string }): Promise<void> => {
    const newGroupId = randomUUID();
    try {
        await groupApi.createGroup({name: name, id: newGroupId}, xAuthUser);
    } catch (error) {
        console.error('Unable to create group:', error);
    }
    return;
};

const updateGroup = async ({ name, id, xAuthUser }: { name: string, id: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.updateGroupName(name, xAuthUser, id);
    } catch (error) {
        console.error('Unable to update group:', error);
    }
    return;
};

const getGroup = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<PickGroupIdOrNameOrOwnerId_> => {
    try {
        const groupData = await groupApi.getGroup(xAuthUser, groupId);
        return groupData.data;
    } catch (error) {
        console.error('Unable to get group:', error);
        return {} as PickGroupIdOrNameOrOwnerId_;
    }
};

const deleteGroup = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.deleteGroup(xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to delete group:', error);
    }
    return;
};

const getGroupShoppers = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<Array<Shopper>> => {
    try {
        const shoppersData = await groupApi.getGroupShoppers(xAuthUser, groupId);
        return shoppersData.data;
    } catch (error) {
        console.error('Unable to get group shoppers:', error);
        return [];
    }
};

export default {
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupShoppers
};