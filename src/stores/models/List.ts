import { t, Instance, flow } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';
import { Category, Item } from 'pantryplus-api-client/v2';

import { api } from '@/api';

import { CategoryModel } from './Category';
import { ItemModel } from './Item';
import { uiStore } from '@/stores/UIStore';

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
    unpurchasedItemsCount: t.optional(t.number, 0),
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
    addCategory: flow(function*({ name, xAuthUser, xAuthLocation, defaultOpen }: { name: string, xAuthUser: string, xAuthLocation: string, defaultOpen?: boolean }): Generator<any, any, any> {
        const newCategoryId = randomUUID();
        const ordinal = self.categories.length;
        const newCategory = CategoryModel.create({ id: newCategoryId, name, ordinal });
        const listId = self.id;
        try {
            yield api.list.addListCategory({ listId, category: { id: newCategoryId, name, ordinal, listId }, xAuthUser, xAuthLocation });
            self.categories.push(newCategory);

            // Set the default open state for the new category if provided
            if (defaultOpen !== undefined) {
                // Import uiStore here to avoid circular dependency issues
                const { uiStore } = require('@/stores/UIStore');
                uiStore.setOpenCategory(newCategoryId, defaultOpen);
            }
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
    loadCategories: flow(function*({ xAuthUser, xAuthLocation }: { xAuthUser: string, xAuthLocation: string }): Generator<any, any, any> {
        // Check if the node is still in the tree
        if (!self.id) return;

        try {
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

            // Set default open state for loaded categories based on allFoldersOpen setting
            // Only set if categories don't already have an open state defined
            const { uiStore } = require('@/stores/UIStore');
            categories.forEach((category: CategoryType) => {
                const existingOpenState = uiStore.openCategories.get(category.id);
                if (existingOpenState === undefined) {
                    // Category doesn't have an open state set yet, use the global setting
                    uiStore.setOpenCategory(category.id, uiStore.allFoldersOpen);
                }
            });
        } catch (error) {
            console.error(`Error loading categories: ${error}`);
        }
    }),
    syncCategories: flow(function*({ xAuthUser, xAuthLocation }: { xAuthUser: string, xAuthLocation: string }): Generator<any, any, any> {
        // Incrementally sync categories and their items: only add/remove/update what changed to avoid flicker
        if (!self.id) return;

        try {
            const categoriesData = yield api.list.getListCategories({ listId: self.id, xAuthUser, xAuthLocation });

            // Create maps for efficient lookup
            const serverCategoryMap = new Map<string, Category>();
            categoriesData.forEach((category: Category) => {
                serverCategoryMap.set(category.id, category);
            });

            const serverCategoryIds = new Set(serverCategoryMap.keys());

            // Remove categories that are no longer on the server
            const categoriesToRemove: string[] = [];
            self.categories.forEach(category => {
                if (!serverCategoryIds.has(category.id)) {
                    categoriesToRemove.push(category.id);
                }
            });
            categoriesToRemove.forEach(categoryId => {
                const index = self.categories.findIndex(c => c.id === categoryId);
                if (index >= 0) {
                    self.categories.splice(index, 1);
                }
            });

            // Update existing categories (name, ordinal) and sync their items
            // Create a snapshot of category IDs to iterate over, as categories may be removed during iteration
            const categoryIdsToSync = Array.from(self.categories.map(cat => cat.id));
            for (const categoryId of categoryIdsToSync) {
                // Re-find category in case it was removed
                const category = self.categories.find(cat => cat.id === categoryId);
                if (!category) {
                    continue; // Category was removed, skip it
                }

                const serverCategory = serverCategoryMap.get(categoryId);
                if (serverCategory) {
                    // Update category properties if they changed
                    if (category.name !== serverCategory.name) {
                        category.name = serverCategory.name;
                    }
                    const serverOrdinal = serverCategory.ordinal ?? 0;
                    if (category.ordinal !== serverOrdinal) {
                        category.ordinal = serverOrdinal;
                    }
                    // Sync items for this category (will check if alive internally)
                    yield category.syncCategoryItems({ xAuthUser });
                }
            }

            // Add categories that are on the server but not locally (added by someone else)
            // Re-check local state right before adding to prevent race conditions with concurrent syncs
            const { uiStore } = require('@/stores/UIStore');
            for (const serverCategory of categoriesData) {
                // Re-check if category already exists locally (may have been added by concurrent sync)
                const categoryAlreadyExists = self.categories.some(cat => cat.id === serverCategory.id);
                if (!categoryAlreadyExists) {
                    const newCategory = CategoryModel.create({
                        id: serverCategory.id,
                        name: serverCategory.name,
                        ordinal: serverCategory.ordinal ?? 0
                    });
                    self.categories.push(newCategory);

                    // Load items for the new category
                    yield newCategory.loadCategoryItems({ xAuthUser });

                    // Set default open state for new category
                    const existingOpenState = uiStore.openCategories.get(newCategory.id);
                    if (existingOpenState === undefined) {
                        uiStore.setOpenCategory(newCategory.id, uiStore.allFoldersOpen);
                    }
                }
            }
        } catch (error) {
            console.error(`Error syncing categories: ${error}`);
        }
    }),
    loadListItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Check if the node is still in the tree
        if (!self.id) return;

        try {
            const itemsData = yield api.list.getListItems({ listId: self.id, xAuthUser });

            const items = itemsData.map(
                (item: Item) => {
                    const { id, name, upc } = item;
                    return ItemModel.create({ id, name, upc });
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
    syncListItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Incrementally sync uncategorized list items: only add/remove what changed to avoid flicker
        if (!self.id) return;

        try {
            const itemsData = yield api.list.getListItems({ listId: self.id, xAuthUser });

            // Create maps for efficient lookup
            const serverItemMap = new Map<string, Item>();
            itemsData.forEach((item: Item) => {
                serverItemMap.set(item.id, item);
            });

            const localItemIds = new Set(self.items.map(item => item.id));
            const serverItemIds = new Set(serverItemMap.keys());

            // Remove items that are no longer on the server (purchased by someone else)
            const itemsToRemove: string[] = [];
            self.items.forEach(item => {
                if (!serverItemIds.has(item.id)) {
                    itemsToRemove.push(item.id);
                }
            });
            itemsToRemove.forEach(itemId => {
                const index = self.items.findIndex(i => i.id === itemId);
                if (index >= 0) {
                    self.items.splice(index, 1);
                }
            });

            // Add items that are on the server but not locally (added by someone else)
            // Skip items that were recently removed locally to prevent race conditions
            // Re-check local state right before adding to prevent race conditions with concurrent syncs
            serverItemIds.forEach(itemId => {
                if (!uiStore.wasItemRecentlyRemoved(itemId)) {
                    // Re-check if item already exists locally (may have been added by concurrent sync)
                    const itemAlreadyExists = self.items.some(item => item.id === itemId);
                    if (!itemAlreadyExists) {
                        const serverItem = serverItemMap.get(itemId)!;
                        const newItem = ItemModel.create({
                            id: serverItem.id,
                            name: serverItem.name,
                            upc: serverItem.upc
                        });
                        self.items.push(newItem);
                    }
                }
            });
        } catch (error) {
            console.error(`Error syncing list items: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string }): Generator<any, any, any> {
        try {
            const newItemId = randomUUID();
            const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc });
            yield newItem.saveItem(xAuthUser);
            yield api.list.associateListItem({ listId: self.id, itemId: newItemId, xAuthUser });
            self.items.push(newItem);
            // Update the count after adding an item
            const count = yield api.list.getListItemsCount({ listId: self.id, xAuthUser });
            self.unpurchasedItemsCount = count;
        } catch (error) {
            console.error(`Error adding item to list: ${error}`);
        }
    }),
    removeItem: flow(function*({ itemId, xAuthUser }: { itemId: string, xAuthUser: string }): Generator<any, any, any> {
        try {
            // Mark item as recently removed to prevent it from reappearing during sync
            uiStore.markItemAsRecentlyRemoved(itemId);
            yield api.list.removeListItem({ listId: self.id, itemId, xAuthUser });
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }
            // Update the count after removing an item
            const count = yield api.list.getListItemsCount({ listId: self.id, xAuthUser });
            self.unpurchasedItemsCount = count;
        } catch (error) {
            console.error(`Error removing item from list: ${error}`);
        }
    }),
    purchaseItem: flow(function*({ itemId, xAuthUser, xAuthLocation }: { itemId: string, xAuthUser: string, xAuthLocation: string }): Generator<any, any, any> {
        try {
            yield api.list.purchaseItem({ listId: self.id, itemId, xAuthUser, xAuthLocation });
            // Update the count after purchasing an item
            const count = yield api.list.getListItemsCount({ listId: self.id, xAuthUser });
            self.unpurchasedItemsCount = count;
        } catch (error) {
            console.error(`Error purchasing item: ${error}`);
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
    setOrdinal: flow(function* (ordinal: number, xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.list.updateList({ list: { id: self.id, name: self.name, groupId: self.groupId ?? undefined, ordinal }, xAuthUser });
            self.ordinal = ordinal;
        } catch (error) {
            console.error(`Error updating list: ${error}`);
        }
        self.ordinal = ordinal;
    }),
    loadUnpurchasedItemsCount: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Check if the node is still in the tree
        if (!self.id) return;

        try {
            const count = yield api.list.getListItemsCount({ listId: self.id, xAuthUser });
            // Only proceed if the node is still in the tree
            if (self.id) {
                self.unpurchasedItemsCount = count;
            }
        } catch (error) {
            console.error(`Error loading unpurchased items count: ${error}`);
        }
    })
}));