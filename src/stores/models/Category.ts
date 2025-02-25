import { runInAction } from 'mobx';
import { flow, Instance, t } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';

import { api } from '@/api';
import { ItemModel } from './Item';
import { Item } from 'pantryplus-api-client';
export type ItemType = Instance<typeof ItemModel>;

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    ordinal: t.number, // zero-based index
    items: t.optional(t.array(ItemModel), []),
}).actions(self => ({
    setName: flow(function*(name: string, xAuthUser: string): Generator<any, any, any> {
        const { id, ordinal = 0 } = self;
        try {
            const xAuthLocation = yield api.location.getNearestStore(xAuthUser);
            yield api.category.updateCategory({ categoryId: id, name, ordinal, xAuthLocation, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string }): Generator<any, any, any> {
        const newItemId = randomUUID(); 
        const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc, ordinal: self.items.length });
        try {
            yield newItem.saveItem(xAuthUser);
            yield api.category.associateCategoryItem({ categoryId: self.id, itemId: newItemId, xAuthUser });
            self.items.push(newItem);
        } catch (error) {
            console.error(`Error adding item to category: ${error}`);
        }
    }),
    removeItem: flow(function*({ itemId, xAuthUser }: { itemId: string, xAuthUser: string }): Generator<any, any, any> {
        try {
            yield api.category.removeCategoryItem({ categoryId: self.id, itemId, xAuthUser });
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }
        } catch (error) {
            console.error(`Error removing item from category: ${error}`);
        }
    }),
    loadCategoryItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        try {
            const itemsData = yield api.category.loadCategoryItems({ categoryId: self.id, xAuthUser });
            const newItems = itemsData.map(
                (item: Item, index: number) => {
                    const { id, name, upc } = item;
                    return ItemModel.create({ id, name, upc, ordinal: index });
                }
            );
            runInAction(() => {
                self.items.clear();
                newItems.forEach((item: ItemType) => self.items.push(item));
            });
        } catch (error) {
            console.error(`Error loading category items: ${error}`);
        }
    }),
    updateItemOrder: ({ data, from, to }: { data: ItemType[], from: number, to: number }) => {
        data.forEach((item, index) => {
            if (item.ordinal !== index) {
                const updatedItem = self.items.find(i => i.id === item.id);
                updatedItem!.setOrdinal(index);
            }
        });
    },
    setOrdinal: flow(function* (ordinal: number, xAuthUser: string): Generator<any, any, any> {
        self.ordinal = ordinal;
        try {
            const xAuthLocation = yield api.location.getNearestStore(xAuthUser);
            yield api.category.updateCategory({ categoryId: self.id, name: self.name, ordinal, xAuthLocation, xAuthUser });
        } catch (error) {
            console.error(`Error setting Category ordinal: ${error}`);
        }
    }),
}));

