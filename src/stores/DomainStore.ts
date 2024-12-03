import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow } from 'mobx-state-tree';
import { persist } from 'mst-persist';

import { UserModel } from './models/User';
import { ListModel } from './models/List';
import { ShopperModel } from './models/Shopper';
import { GroupModel } from './models/Group';
import { LocationModel } from './models/Location';
import api from '@/api';
import { randomUUID } from 'expo-crypto';

export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;
export type ListType = Instance<typeof ListModel>;
export type GroupType = Instance<typeof GroupModel>;
export type LocationType = Instance<typeof LocationModel>;

const DomainStoreModel = t
    .model("DomainStoreModel", {
        user: t.maybe(UserModel),
        lists: t.array(ListModel),
        groups: t.optional(t.array(GroupModel), []),
        locations: t.optional(t.array(LocationModel), []),
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
            const newList: ListType = ListModel.create({
                id: randomUUID(),
                name: name,
                userIsOwner: true,
                groupId: undefined,
                categories: [],
            });
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            yield api.list.createList({ list: newList, ownerId, xAuthUser });
            self.lists.push(newList);
        }),
        loadLists: flow(function* () {
            const lists = yield api.shopper.getUserLists({ user: self.user! });
            self.lists.replace(lists);
        })
    }))
    .views(self => ({
        getListCategories(id: string) {
            return self.lists.find(list => list.id === id)?.categories;
        },
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