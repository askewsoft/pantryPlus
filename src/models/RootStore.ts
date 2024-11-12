import React, { createContext } from 'react';
import { t, Instance, flow } from 'mobx-state-tree';
import { UserModel } from './User';
import { ShopperModel } from './Shopper';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;

const RootStoreModel = t
    .model("RootStoreModel", {
        user: t.optional(UserModel, {}),
        shoppers: t.optional(t.array(ShopperModel), []),
    })
    .actions(self => ({
        getAuthenticatedUser: flow(function* getAuthenticatedUser() {
            //console.log('#4 self.user:', `'${JSON.stringify(self.user)}'`);
            if (self.user?.email && self.user?.sub && self.user?.nickname) {
                return self.user;
            } else {
                try {
                    const authenticatedUser = yield getCurrentUser();
                    //console.log('#5 authenticatedUser:', `'${JSON.stringify(authenticatedUser)}'`);
                    //console.log('#6 fetching user attributes');
                    const attributes = yield fetchUserAttributes();
                    //console.log('#7 fetched user');
                    self.user = UserModel.create({
                        email: attributes.email || '',
                        sub: attributes.sub || '',
                        nickname: attributes.nickname || ''
                    });
                    //console.log('#8 self.user:', `'${JSON.stringify(self.user)}'`);
                    return self.user;
                } catch (error) {
                  console.warn('Unable to fetch user attributes:', error);
                }
            }
        })
    }));

type RootStoreType = Instance<typeof RootStoreModel>;

const initialContext = RootStoreModel.create({});
export const rootStore = initialContext;

export const RootStoreContext = createContext<RootStoreType | null>(null);
export const ContextProvider = RootStoreContext.Provider;