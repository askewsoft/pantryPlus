import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow } from 'mobx-state-tree';
import { persist } from 'mst-persist';
import { List } from 'pantryPlusApiClient';

import api from '@/api';

import { UserModel } from './models/User';
import { ListModel } from './models/List';
import { ShopperModel } from './models/Shopper';
import { GroupModel } from './models/Group';
import { LocationModel } from './models/Location';

import { randomUUID } from 'expo-crypto';
import logging from '@/config/logging';

export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;
export type ListType = Instance<typeof ListModel>;
export type GroupType = Instance<typeof GroupModel>;
export type LocationType = Instance<typeof LocationModel>;

const DomainStoreModel = t
    .model("DomainStoreModel", {
        user: t.maybe(UserModel),
        lists: t.array(ListModel),
        groups: t.array(GroupModel),
        locations: t.array(LocationModel),
    })
    .actions(self => ({
        initUser: flow(function* () {
            const authenticatedUser = yield api.shopper.registerUser();
            self.user = authenticatedUser;
        }),
        initialize: () => {
            AsyncStorage.removeItem('pantryPlusDomain');
            self.user = undefined;
            self.lists.replace([]);
            self.groups.replace([]);
            self.locations.replace([]);
        },
        addList: flow(function* (name: string) {
            logging.debug ? console.log(`addList: ${name}`) : null;
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            const newListId = randomUUID();
            const newList: ListType = ListModel.create({
                id: newListId,
                name: name,
                userIsOwner: true,
                groupId: undefined,
                categories: [],
            });
            yield api.list.createList({ list: {name, id: newListId, ownerId}, xAuthUser });
            logging.debug ? console.log(`addList: ${newList}`) : null;
            self.lists.push(newList);
        }),
        loadLists: flow(function* () {
            const listsData = yield api.shopper.getUserLists({ user: self.user! });
            const lists = listsData.map(
                (list: List) => {
                    const { id, name, ownerId, groupId } = list;
                    const userIsOwner = ownerId === self.user?.id;
                    return ListModel.create({ id, name, userIsOwner, groupId });
                }
            );
            self.lists.replace(lists);
        })
    }));

type DomainStoreType = Instance<typeof DomainStoreModel>;

export const domainStore = DomainStoreModel.create({});
export const DomainStoreContext = createContext<DomainStoreType | null>(null);
export const DomainStoreContextProvider = DomainStoreContext.Provider;

// saves to and loads from device storage
persist('pantryPlusDomain', domainStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['locations']
});