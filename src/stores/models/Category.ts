import { runInAction } from 'mobx';
import { flow, Instance, t } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';

import { api } from '@/api';
import { ItemModel } from './Item';
import { Item } from 'pantryplus-api-client/v1';

export type ItemType = Instance<typeof ItemModel>;

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    ordinal: t.number, // zero-based index
    items: t.optional(t.array(ItemModel), []),
}).actions(self => ({
    setName: flow(function*(name: string, xAuthUser: string, xAuthLocation: string): Generator<any, any, any> {
        const { id, ordinal = 0 } = self;
        try {
            yield api.category.updateCategory({ categoryId: id, name, ordinal, xAuthLocation, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser, onItemAdded }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string, onItemAdded?: () => void }): Generator<any, any, any> {
        try {
            const newItemId = randomUUID(); 
            const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc });
            yield newItem.saveItem(xAuthUser);
            yield api.category.associateCategoryItem({ categoryId: self.id, itemId: newItemId, xAuthUser });
            self.items.push(newItem);
            
            // Notify parent that an item was added so it can update its count
            if (onItemAdded) {
                onItemAdded();
            }
            
            // If this was the first item added to the category and allFoldersOpen is true,
            // open the category to make it visible
            if (self.items.length === 1) {
                const { uiStore } = require('@/stores/UIStore');
                if (uiStore.allFoldersOpen) {
                    uiStore.setOpenCategory(self.id, true);
                }
            }
        } catch (error) {
            console.error(`Error adding item to category: ${error}`);
        }
    }),
    removeItem: flow(function*({ itemId, xAuthUser, onItemRemoved }: { itemId: string, xAuthUser: string, onItemRemoved?: () => void }): Generator<any, any, any> {
        try {
            // we intentionally do not call the API, we do not want to remove the item from the category
            // the component will remove the item from the shopping list
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }
            
            // Notify parent that an item was removed so it can update its count
            if (onItemRemoved) {
                onItemRemoved();
            }
        } catch (error) {
            console.error(`Error removing item from shopping list: ${error}`);
        }
    }),
    unCategorizeItem: flow(function*({ itemId, xAuthUser, onItemRemoved }: { itemId: string, xAuthUser: string, onItemRemoved?: () => void }): Generator<any, any, any> {
        try {
            // disassociate the item from the category and remove the item from the shopping list
            yield api.category.removeCategoryItem({ categoryId: self.id, itemId, xAuthUser });
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }
            
            // Notify parent that an item was removed so it can update its count
            if (onItemRemoved) {
                onItemRemoved();
            }
        } catch (error) {
            console.error(`Error un-categorizing item: ${error}`);
        }
    }),
    loadCategoryItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        try {
            const itemsData = yield api.category.loadCategoryItems({ categoryId: self.id, xAuthUser });
            const newItems = itemsData.map(
                (item: Item) => {
                    const { id, name, upc } = item;
                    return ItemModel.create({ id, name, upc });
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

    setOrdinal: flow(function* (ordinal: number, xAuthUser: string, xAuthLocation: string): Generator<any, any, any> {
        self.ordinal = ordinal;
        try {
            yield api.category.updateCategory({ categoryId: self.id, name: self.name, ordinal, xAuthLocation, xAuthUser });
        } catch (error) {
            console.error(`Error setting Category ordinal: ${error}`);
        }
    }),
}));

