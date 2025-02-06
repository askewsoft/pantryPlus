import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow, onAction } from 'mobx-state-tree';
import { persist } from 'mst-persist';
import * as Location from 'expo-location';
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
import { Alert } from 'react-native';

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
        locationEnabled: t.optional(t.boolean, false),
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
        setLocationEnabled: (locationEnabled: boolean) => {
            self.locationEnabled = locationEnabled;
        },
        addList: flow(function* (name: string) {
            const ordinal = self.lists.length;
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            const newListId = randomUUID();
            const list = {
                id: newListId,
                name: name,
                ordinal,
                ownerId,
                groupId: undefined,
                categories: [],
            };
            yield api.list.createList({ list, xAuthUser });
            const newList: ListType = ListModel.create(list);
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
            uiStore.setGroupsLoaded(false);
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
        },
        addLocation: flow(function* ({name}: {name: string}) {
            const xAuthUser = self.user?.email!;
            const newLocationId = randomUUID();

            const { status } = yield Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Location permission not granted');
                return;
            }
            const currentLatLongAlt = yield Location.getCurrentPositionAsync();
            const location = {
                id: newLocationId,
                name: name,
                latitude: currentLatLongAlt.coords.latitude,
                longitude: currentLatLongAlt.coords.longitude,
            };
            yield api.location.createLocation({ location, xAuthUser });
            const newLocation = LocationModel.create(location);
            self.locations.push(newLocation);
        }),
        loadLocations: flow(function* () {
            uiStore.setLocationsLoaded(false);
            const locationsData = yield api.shopper.getUserLocations({ user: self.user! });
            const locations = locationsData.map(
                (location: LocationType) => {
                    const { id, name, latitude, longitude } = location;
                    return LocationModel.create({ id, name, latitude, longitude });
                }
            );
            self.locations.replace(locations);
            uiStore.setLocationsLoaded(true);
        }),
        debugStorage: flow(function* () {
            const keys = yield AsyncStorage.getAllKeys();
            const items = yield AsyncStorage.multiGet(keys);
            console.log('AsyncStorage contents:', items);
            return items;
        }),
    }));

type DomainStoreType = Instance<typeof DomainStoreModel>;

export const domainStore = DomainStoreModel.create({});

// saves to and loads from device storage
persist('pantryPlusDomain', domainStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['locations']
});

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

export const DomainStoreContext = createContext<DomainStoreType | null>(null);
export const DomainStoreContextProvider = DomainStoreContext.Provider;