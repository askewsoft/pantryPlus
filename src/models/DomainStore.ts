import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow } from 'mobx-state-tree';
import { persist } from 'mst-persist';

import { UserModel } from './User';
import { ListModel } from './List';
import { ShopperModel } from './Shopper';
import { GroupModel } from './Group';
import { LocationModel } from './Location';
import api from '@/api';

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
        initUser: async () => {
            const authenticatedUser = await api.shopper.registerUser();
            self.user = authenticatedUser;
        },
        initialize: () => {
            AsyncStorage.removeItem('pantryPlusDomain');
            self.user = undefined;
            self.lists.replace([]);
            self.groups.replace([]);
            self.locations.replace([]);
        },
        addList: flow(function* (list: ListType) {
            const xAuthUser = self.user?.email!;
            const ownerId = self.user?.id!;
            yield api.list.createList(list, ownerId, xAuthUser!);
            self.lists.push(list);
        }),
        loadLists: flow(function* () {
            const lists = yield api.shopper.getUserLists(self.user!);
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