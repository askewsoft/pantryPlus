import {
    GroupsApi,
    Shopper,
    Configuration,
    PickGroupIdOrNameOrOwner_,
    PickShopperEmail_,
    PickShopperId_,
    PickGroupName_
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
    const body: PickGroupName_ = { name: name };
    try {
        await groupApi.updateGroupName(body, xAuthUser, id);
    } catch (error) {
        console.error('Unable to update group:', error);
    }
    return;
};

const getGroup = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<PickGroupIdOrNameOrOwner_> => {
    try {
        const groupData = await groupApi.getGroup(xAuthUser, groupId);
        return groupData.data;
    } catch (error) {
        console.error('Unable to get group:', error);
        return {} as PickGroupIdOrNameOrOwner_;
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
    const body: PickShopperId_ = { id: shopperId };
    try {
        await groupApi.addShopperToGroup(body, xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to add shopper to group:', error);
    }
    return;
};

const addInviteeToGroup = async ({ groupId, inviteeEmail, xAuthUser }: { groupId: string, inviteeEmail: string, xAuthUser: string }): Promise<void> => {
    const body: PickShopperEmail_ = { email: inviteeEmail };
    try {
        await groupApi.inviteShopper(body, xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to add invitee to group:', error);
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

const removeInviteeFromGroup = async ({ groupId, inviteeEmail, xAuthUser }: { groupId: string, inviteeEmail: string, xAuthUser: string }): Promise<void> => {
    const body: PickShopperEmail_ = { email: inviteeEmail };
    try {
        await groupApi.uninviteShopper(body, xAuthUser, groupId);
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

const getGroupInvitees = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<Array<PickShopperEmail_>> => {
    try {
        const inviteesData = await groupApi.getInvitees(xAuthUser, groupId);
        return inviteesData.data;
    } catch (error) {
        console.error('Unable to get group invitees:', error);
        return [];
    }
};

export default {
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addShopperToGroup,
    addInviteeToGroup,
    removeShopperFromGroup,
    removeInviteeFromGroup,
    getGroupShoppers,
    getGroupInvitees
};