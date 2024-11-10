import React, { createContext, ComponentType } from 'react';
import { t, Instance } from 'mobx-state-tree';
import { UserModel } from './User';
import { ShopperModel } from './Shopper';

export type UserType = Instance<typeof UserModel>;
export type ShopperType = Instance<typeof ShopperModel>;

const RootStoreModel = t
    .model("RootStoreModel", {
        user: t.optional(UserModel, {}),
        shoppers: t.optional(t.array(ShopperModel), []),
    });

type RootStoreType = Instance<typeof RootStoreModel>;

const defaultUser = UserModel.create({});
const defaultShopper = ShopperModel.create({});
const initialContext = RootStoreModel.create({user: defaultUser, shoppers: [defaultShopper]});
export const rootStore = initialContext;

export const RootStoreContext = createContext<RootStoreType | null>(null);
export const ContextProvider = RootStoreContext.Provider;