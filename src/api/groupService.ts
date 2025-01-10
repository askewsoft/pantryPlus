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

const createGroup = async ({ name, newGroupId, xAuthUser }: { name: string, newGroupId: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.createGroup({name: name, id: newGroupId}, xAuthUser);
    } catch (error) {
        console.error('Unable to create group:', error);
    }
    return;
};

const updateGroup = async ({ name, id, xAuthUser }: { name: string, id: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.updateGroupName({name}, xAuthUser, id);
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

const addShopperToGroup = async ({ groupId, shopperId, xAuthUser }: { groupId: string, shopperId: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.addShopperToGroup(shopperId, xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to add shopper to group:', error);
    }
    return;
};

const inviteShopperToGroup = async ({ groupId, shopperEmail, xAuthUser }: { groupId: string, shopperEmail: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.inviteShopper(shopperEmail, xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to invite shopper to group:', error);
    }
    return;
};

const removeShopperFromGroup = async ({ groupId, shopperId, xAuthUser }: { groupId: string, shopperId: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.removeShopperFromGroup(xAuthUser, groupId, shopperId);
    } catch (error) {
        console.error('Unable to remove shopper from group:', error);
    }
    return;
};

const removeInviteeFromGroup = async ({ groupId, shopperEmail, xAuthUser }: { groupId: string, shopperEmail: string, xAuthUser: string }): Promise<void> => {
    try {
        await groupApi.uninviteShopper(shopperEmail, xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to remove invitee from group:', error);
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
    addShopperToGroup,
    inviteShopperToGroup,
    removeShopperFromGroup,
    removeInviteeFromGroup,
    getGroupShoppers
};