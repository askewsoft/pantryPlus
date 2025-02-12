import { t, Instance, flow } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';
import { Category, Item, List, LocationArea } from 'pantryPlusApiClient';

import api from '@/api';

import { CategoryModel } from './Category';
import { ItemModel } from './Item';

import logging from '@/config/logging';

export type ItemType = Instance<typeof ItemModel>;
export type CategoryType = Instance<typeof CategoryModel>;
export type ListType = Instance<typeof ListModel>;

export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
    ordinal: t.number, // zero-based index
    ownerId: t.string,
    groupId: t.maybeNull(t.string),
    categories: t.array(CategoryModel),
    items: t.array(ItemModel),
})
.actions(self => ({
    updateList: flow(function*({ name, groupId, xAuthUser }: { name: string, groupId: string | null, xAuthUser: string }): Generator<any, any, any> {
        try {
            yield api.list.updateList({ list: { id: self.id, name, groupId: groupId ?? undefined, ordinal: self.ordinal }, xAuthUser });
            self.name = name;
            self.groupId = groupId;
        } catch (error) {
            console.error(`Error updating list: ${error}`);
        }
    }),
    addCategory: flow(function*({ name, xAuthUser }: { name: string, xAuthUser: string }): Generator<any, any, any> {
        const newCategoryId = randomUUID();
        const ordinal = self.categories.length;
        const newCategory = CategoryModel.create({ id: newCategoryId, name, ordinal });
        const listId = self.id;
        try {
            yield api.list.addListCategory({ listId, category: { id: newCategoryId, name, ordinal, listId }, xAuthUser });
            self.categories.push(newCategory);
        } catch (error) {
            console.error(`Error adding category to list: ${error}`);
        }
    }),
    removeCategory: flow(function* ({ categoryId, xAuthUser }: { categoryId: string, xAuthUser: string }): Generator<any, any, any> {
        const index = self.categories?.findIndex(c => c.id === categoryId);
        try {
            yield api.list.deleteListCategory({ listId: self.id, categoryId, xAuthUser });
            if (index !== undefined && index >= 0) {
                self.categories!.splice(index, 1);
            }
        } catch (error) {
            console.error(`Error removing category from list: ${error}`);
        }
    }),
    loadCategories: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Check if the node is still in the tree
        if (!self.id) return;

        try {
            const userLocation = yield api.location.getCurrentLocation();
            const locationArea: LocationArea = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                radius: 15000, // in meters -- TODO: make this dynamic?
            }
            const nearestStores = yield api.location.getNearbyLocations({ xAuthUser, locationArea });
            console.log('nearestStores', nearestStores);
            const xAuthLocation = nearestStores[0]?.id;
            console.log('xAuthLocation', xAuthLocation);
            console.log('getListCategories', { listId: self.id, xAuthUser, xAuthLocation });
            const categoriesData = yield api.list.getListCategories({ listId: self.id, xAuthUser, xAuthLocation });
            const categories = categoriesData.map(
                (category: Category) => {
                    const { id, name, ordinal } = category;
                    return CategoryModel.create({ id, name, ordinal: ordinal ?? 0 });
                }
            );
            // Replace categories array before loading category items
            self.categories.clear();
            self.categories.replace(categories);

            // Load items for each category
            for (const category of self.categories) {
                if (self.id) {
                    yield category.loadCategoryItems({ xAuthUser });
                }
            }
        } catch (error) {
            console.error(`Error loading categories: ${error}`);
        }
    }),
    loadListItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Check if the node is still in the tree
        if (!self.id) return;

        try {
            const itemsData = yield api.list.getListItems({ listId: self.id, xAuthUser });

            const items = itemsData.map(
                (item: Item, index: number) => {
                    const { id, name, upc } = item;
                    return ItemModel.create({ id, name, upc, ordinal: index });
                }
            );
            // Only proceed if the node is still in the tree
            if (self.id) {
                self.items.clear();
                self.items.replace(items);
            }
        } catch (error) {
            console.error(`Error loading items: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string }): Generator<any, any, any> {
        const newItemId = randomUUID();
        const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc, ordinal: self.items.length });
        try {
            yield newItem.saveItem(xAuthUser);
            yield api.list.associateListItem({ listId: self.id, itemId: newItemId, xAuthUser });
            self.items.push(newItem);
        } catch (error) {
            console.error(`Error adding item to list: ${error}`);
        }
    }),
    removeItem: flow(function*({ itemId, xAuthUser }: { itemId: string, xAuthUser: string }): Generator<any, any, any> {
        try {
            yield api.list.removeListItem({ listId: self.id, itemId, xAuthUser });
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }
        } catch (error) {
            console.error(`Error removing item from list: ${error}`);
        }
    }),
    associateItemToList: flow(function*({ item, xAuthUser }: { item: Item, xAuthUser: string }): Generator<any, any, any> {
        try {
            yield api.list.associateListItem({ listId: self.id, itemId: item.id, xAuthUser });
            self.items.push(item);
        } catch (error) {
            console.error(`Error associating item to list: ${error}`);
        }
    }),
    updateCategoryOrder: flow(function* ({ data, xAuthUser }: { data: CategoryType[], xAuthUser: string }): Generator<any, any, any> {
        data.forEach((category, index) => {
            if (category.ordinal !== index) {
                /* each category in data is a copy of the CategoryModel's properties only
                * It is not an instance of CategoryModel and lacks actions & views
                * We must find the CategoryModel instance to execute the self-mutating action
                */
                const updatedCategory = self.categories.find(c => c.id === category.id);
                updatedCategory!.setOrdinal(index, xAuthUser);
            }
        });
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
        try {
            yield api.list.updateList({ list: { id: self.id, name: self.name, groupId: self.groupId ?? undefined, ordinal }, xAuthUser });
            self.ordinal = ordinal;
        } catch (error) {
            console.error(`Error updating list: ${error}`);
        }
        self.ordinal = ordinal;
    })
}));