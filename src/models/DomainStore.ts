import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t, Instance, flow } from 'mobx-state-tree';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { persist } from 'mst-persist';

import { UserModel } from './User';
import { ListModel } from './List';
import { ShopperModel } from './Shopper';
import { GroupModel } from './Group';
import { LocationModel } from './Location';

export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;

const DomainStoreModel = t
    .model("DomainStoreModel", {
        user: t.maybe(UserModel),
        lists: t.array(ListModel),
        groups: t.optional(t.array(GroupModel), []),
        locations: t.optional(t.array(LocationModel), []),
    })
    .actions(self => ({
        getAuthenticatedUser: flow(function* getAuthenticatedUser() {
            if (self.user?.email) {
                return self.user;
            } else {
                try {
                    const attributes = yield fetchUserAttributes();
                    self.user = UserModel.create({
                        email: attributes.email || '',
                        id: attributes.sub || '',
                        nickname: attributes.nickname || ''
                    });
                    return self.user;
                } catch (error) {
                  console.warn('Unable to fetch user attributes:', error);
                  throw error;
                }
            }
        })
    }));

type DomainStoreType = Instance<typeof DomainStoreModel>;

export const domainStore = DomainStoreModel.create({});

// saves to and loads from device storage
persist('pantryPlusDomain', domainStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['locations']
});

export const DomainStoreContext = createContext<DomainStoreType | null>(null);
export const DomainStoreContextProvider = DomainStoreContext.Provider;