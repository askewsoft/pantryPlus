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
            self.lists.spliceWithArray(0, self.lists.length, []);
            self.groups.spliceWithArray(0, self.groups.length, []);
            self.locations.spliceWithArray(0, self.locations.length, []);
        },
        addList: flow(function* (name: string) {
            logging.debug ? console.log(`addList: ${name}`) : null;
            const ordinal = self.lists.length;
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            const newListId = randomUUID();
            const newList: ListType = ListModel.create({
                id: newListId,
                name: name,
                ordinal,
                userIsOwner: true,
                groupId: undefined,
                categories: [],
            });
            yield api.list.createList({ list: {name, id: newListId, ownerId, ordinal}, xAuthUser });
            logging.debug ? console.log(`addList: ${newList}`) : null;
            self.lists.push(newList);
        }),
        loadLists: flow(function* () {
            const listsData = yield api.shopper.getUserLists({ user: self.user! });
            const lists = listsData.map(
                (list: List, index: number) => {
                    const { id, name, ownerId, groupId, ordinal } = list;
                    const userIsOwner = ownerId === self.user?.id;
                    return ListModel.create({ id, name, userIsOwner, groupId, ordinal });
                }
            );
            self.lists.spliceWithArray(0, self.lists.length, lists);
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

// saves to and loads from device storage
persist('pantryPlusDomain', domainStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['locations']
});