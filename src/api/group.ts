import {
    GroupsApi,
    Shopper,
    PickGroupIdOrNameOrOwner,
    PickShopperEmail,
    PickShopperId,
    PickGroupName
} from 'pantryplus-api-client/v1';
import { getApiConfiguration } from '@/services/SessionService';

const createGroup = async ({ name, newGroupId, xAuthUser }: { name: string, newGroupId: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    try {
        await groupApi.createGroup(xAuthUser, {name: name, id: newGroupId});
    } catch (error) {
        console.error('Unable to create group:', error);
    }
    return;
};

const updateGroup = async ({ name, id, xAuthUser }: { name: string, id: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    const body: PickGroupName = { name: name };
    try {
        await groupApi.updateGroupName(xAuthUser, id, body);
    } catch (error) {
        console.error('Unable to update group:', error);
    }
    return;
};

const getGroup = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<PickGroupIdOrNameOrOwner> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    try {
        const groupData = await groupApi.getGroup(xAuthUser, groupId);
        return groupData.data;
    } catch (error) {
        console.error('Unable to get group:', error);
        return {} as PickGroupIdOrNameOrOwner;
    }
};

const deleteGroup = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    try {
        await groupApi.deleteGroup(xAuthUser, groupId);
    } catch (error) {
        console.error('Unable to delete group:', error);
    }
    return;
};

const addShopperToGroup = async ({ groupId, shopperId, xAuthUser }: { groupId: string, shopperId: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    const body: PickShopperId = { id: shopperId };
    try {
        await groupApi.addShopperToGroup(xAuthUser, groupId, body);
    } catch (error) {
        console.error('Unable to add shopper to group:', error);
    }
    return;
};

const addInviteeToGroup = async ({ groupId, inviteeEmail, xAuthUser }: { groupId: string, inviteeEmail: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    const body: PickShopperEmail = { email: inviteeEmail };
    try {
        await groupApi.inviteShopper(xAuthUser, groupId, body);
    } catch (error) {
        console.error('Unable to add invitee to group:', error);
    }
    return;
};

const removeShopperFromGroup = async ({ groupId, shopperId, xAuthUser }: { groupId: string, shopperId: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    try {
        await groupApi.removeShopperFromGroup(xAuthUser, groupId, shopperId);
    } catch (error) {
        console.error('Unable to remove shopper from group:', error);
    }
    return;
};

const removeInviteeFromGroup = async ({ groupId, inviteeEmail, xAuthUser }: { groupId: string, inviteeEmail: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    const body: PickShopperEmail = { email: inviteeEmail };
    try {
        await groupApi.uninviteShopper(xAuthUser, groupId, body);
    } catch (error) {
        console.error('Unable to remove invitee from group:', error);
    }
    return;
};

const getGroupShoppers = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<Array<Shopper>> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
    try {
        const shoppersData = await groupApi.getGroupShoppers(xAuthUser, groupId);
        return shoppersData.data;
    } catch (error) {
        console.error('Unable to get group shoppers:', error);
        return [];
    }
};

const getGroupInvitees = async ({ groupId, xAuthUser }: { groupId: string, xAuthUser: string }): Promise<Array<PickShopperEmail>> => {
    const configuration = await getApiConfiguration();
    const groupApi = new GroupsApi(configuration);
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