import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow, onAction } from 'mobx-state-tree';
import { persist } from 'mst-persist';
import { List } from 'pantryPlusApiClient';

import api from '@/api';
import { uiStore } from './UIStore';

import { UserModel } from './models/User';
import { ListModel } from './models/List';
import { ShopperModel } from './models/Shopper';
import { InviteeModel } from './models/Invitee';
import { GroupModel } from './models/Group';
import { LocationModel } from './models/Location';

import { randomUUID } from 'expo-crypto';
import logging from '@/config/logging';

const debug = logging.debug;
export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;
export type InviteeType = Instance<typeof InviteeModel>;
export type MemberType = ShopperType | InviteeType;
export type ListType = Instance<typeof ListModel>;
export type GroupType = Instance<typeof GroupModel>;
export type LocationType = Instance<typeof LocationModel>;

export interface IUser {
    id: string;
    email: string;
    nickname: string;
    invites: GroupType[];
}

const DomainStoreModel = t
    .model("DomainStoreModel", {
        user: t.maybe(UserModel),
        lists: t.array(ListModel),
        groups: t.array(GroupModel),
        locations: t.array(LocationModel),
    })
    .views(self => ({
        get groupsOwnedByUser() {
            return self.groups.filter(group => group.owner.id === self.user?.id);
        }
    }))
    .actions(self => ({
        initUser: flow(function* () {
            const authenticatedUser = yield api.shopper.registerUser();
            self.user = authenticatedUser;
        }),
        initialize: () => {
            AsyncStorage.removeItem('pantryPlusDomain');
            self.user = undefined;
            self.lists.spliceWithArray(0, self.lists.length, []);
            self.groups.spliceWithArray(0, self.groups.length, []);
            self.locations.spliceWithArray(0, self.locations.length, []);
        },
        addList: flow(function* (name: string) {
            const ordinal = self.lists.length;
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            const newListId = randomUUID();
            const newList: ListType = ListModel.create({
                id: newListId,
                name: name,
                ordinal,
                ownerId,
                groupId: undefined,
                categories: [],
            });
            yield api.list.createList({ list: {name, id: newListId, ownerId, ordinal, groupId: undefined}, xAuthUser });
            self.lists.push(newList);
        }),
        removeList: flow(function* (listId: string) {
            const xAuthUser = self.user?.email!;
            yield api.list.removeList({ listId, xAuthUser });
            self.lists.splice(self.lists.findIndex(l => l.id === listId), 1);
        }),
        loadLists: flow(function* () {
            const listsData = yield api.shopper.getUserLists({ user: self.user! });
            const lists = listsData.map(
                (list: List, index: number) => {
                    const { id, name, ownerId, groupId, ordinal } = list;
                    return ListModel.create({ id, name, ownerId, groupId, ordinal });
                }
            );
            self.lists.replace(lists);
            uiStore.setListsLoaded(true);
        }),
        addGroup: flow(function* (name: string) {
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            const newGroupId = randomUUID();
            const owner = ShopperModel.create({ id: ownerId, email: self.user!.email, nickname: self.user!.nickname });
            const newGroup: GroupType = GroupModel.create({ id: newGroupId, name, owner });
            yield api.group.createGroup({ name, newGroupId, xAuthUser });
            self.groups.push(newGroup);
            return newGroupId;
        }),
        removeGroup: flow(function* (groupId: string) {
            const xAuthUser = self.user?.email!;
            yield api.group.deleteGroup({ groupId, xAuthUser });
            self.groups.splice(self.groups.findIndex(g => g.id === groupId), 1);
        }),
        loadGroups: flow(function* () {
            const groupsData = yield api.shopper.getUserGroups({ user: self.user! });
            const groups = groupsData.map(
                (group: GroupType) => {
                    const { id, name, owner } = group;
                    return GroupModel.create({ id, name, owner, shoppers: [], invitees: [] });
                }
            );

            // Load group members
            for (const group of groups) {
                try { 
                    yield group.loadGroupShoppers({ xAuthUser: self.user?.email! });
                    yield group.loadGroupInvitees({ xAuthUser: self.user?.email! });
                } catch (error) {
                    console.error('Unable to load group members:', error);
                }
            }
            self.groups.replace(groups);
            uiStore.setGroupsLoaded(true);
        }),
        updateListOrder: ({ data, from, to }: { data: ListType[], from: number, to: number }) => {
            const xAuthUser = self.user?.email!;
            data.forEach((list, index) => {
                if (list.ordinal !== index) {
                    /* each list in data is a copy of the ListModel's properties only
                    * It is not an instance of ListModel and lacks actions & views
                    * We must find the ListModel instance to execute the self-mutating action
                    */
                    const updatedList = self.lists.find(l => l.id === list.id);
                    updatedList!.setOrdinal(index, xAuthUser);
                }
            });
        }
    }));

type DomainStoreType = Instance<typeof DomainStoreModel>;

export const domainStore = DomainStoreModel.create({});
export const DomainStoreContext = createContext<DomainStoreType | null>(null);
export const DomainStoreContextProvider = DomainStoreContext.Provider;

// this avoids circular dependencies in UserModel.ts
onAction(domainStore, (call) => {
    if (call.name === 'acceptInvite') {
        domainStore.loadLists();
    }
}, true);

onAction(domainStore, (call) => {
    if (call.name === 'loadLists') {
        uiStore.setListsLoaded(true);
    }
}, true);

// saves to and loads from device storage
persist('pantryPlusDomain', domainStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['locations']
});