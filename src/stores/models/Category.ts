import { flow, Instance, t } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';

import api from '@/api';
import { ItemModel } from './Item';
import { Item } from 'pantryPlusApiClient';
export type ItemType = Instance<typeof ItemModel>;

import logging from '@/config/logging';

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    items: t.array(ItemModel),
}).actions(self => ({
    setName: flow(function*(name: string, xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.category.updateCategory({ categoryId: self.id, name, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string }): Generator<any, any, any> {
        const newItemId = randomUUID(); 
        const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc });
        yield newItem.saveItem(xAuthUser);
        yield api.category.associateCategoryItem({ categoryId: self.id, itemId: newItemId, xAuthUser });
        self.items.push(newItem);
    }),
    loadCategoryItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // TODO: figure out how to load from local storage first, then from server & reconcile
        const itemsData = yield api.category.loadCategoryItems({ categoryId: self.id, xAuthUser });
        const items = itemsData.map(
            (item: Item) => {
                const { id, name, upc } = item;
                return ItemModel.create({ id, name, upc });
            }
        );
        self.items.spliceWithArray(0, self.items.length, items);
    })
}));