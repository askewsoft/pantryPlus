import { flow, Instance, t, isAlive, getParent } from 'mobx-state-tree';
import { randomUUID } from 'expo-crypto';

import { api } from '@/api';
import { ItemModel } from './Item';
import { Item } from 'pantryplus-api-client/v3';
import { uiStore } from '@/stores/UIStore';
import { scheduleIntentCacheSync } from '@/services/intentSync';

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
            scheduleIntentCacheSync();
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
    addItem: flow(function*({ item, xAuthUser, onItemAdded }: { item: Pick<ItemType, 'name' | 'upc'> & { id?: string }, xAuthUser: string, onItemAdded?: () => void }): Generator<any, any, any> {
        try {
            // Candidate only: find-or-create may return an existing ITEM whose id differs from
            // this UUID. Always use saved.id below — never treat candidateId as the real identity.
            const candidateId = item.id ?? randomUUID();
            const saved: Item | null = yield api.item.createItem({
                item: { id: candidateId, name: item.name, upc: item.upc ?? '' },
                xAuthUser,
            });
            if (!saved) {
                throw new Error('find-or-create item returned no result');
            }
            const alreadyInCategory = self.items.some(i => i.id === saved.id);
            if (!alreadyInCategory) {
                yield api.category.associateCategoryItem({ categoryId: self.id, itemId: saved.id, xAuthUser });
                const newItem = ItemModel.create({ id: saved.id, name: saved.name, upc: saved.upc });
                self.items.push(newItem);
            }
            // Exclusive on this list: drop from sibling folders / uncategorized locally
            try {
                const parentList = getParent(self, 2) as {
                    categories?: Array<{ id: string; detachLocalItem?: (id: string) => void }>;
                    detachLocalItem?: (id: string) => void;
                };
                parentList.categories?.forEach(category => {
                    if (category.id !== self.id) {
                        category.detachLocalItem?.(saved.id);
                    }
                });
                parentList.detachLocalItem?.(saved.id);
            } catch {
                // Category may be detached during tests
            }

            scheduleIntentCacheSync();

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
    /** Local-only: append an item already associated via API. */
    attachLocalItem(item: { id: string; name: string; upc?: string }) {
        if (!self.items.some(i => i.id === item.id)) {
            self.items.push(ItemModel.create({ id: item.id, name: item.name, upc: item.upc }));
            scheduleIntentCacheSync();
        }
    },
    /** Local-only: drop an item from this category array without an API call. */
    detachLocalItem(itemId: string) {
        const index = self.items.findIndex(i => i.id === itemId);
        if (index >= 0) {
            self.items.splice(index, 1);
            scheduleIntentCacheSync();
        }
    },
    removeItem: flow(function*({ itemId, xAuthUser, onItemRemoved }: { itemId: string, xAuthUser: string, onItemRemoved?: () => void }): Generator<any, any, any> {
        try {
            // we intentionally do not call the API, we do not want to remove the item from the category
            // the component will remove the item from the shopping list
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }

            scheduleIntentCacheSync();

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
            // Clear this category link only; caller keeps list membership via clear-all or attach.
            yield api.category.unlinkCategoryItem({ categoryId: self.id, itemId, xAuthUser });
            const index = self.items?.findIndex(i => i.id === itemId);
            if (index !== undefined && index >= 0) {
                self.items!.splice(index, 1);
            }

            scheduleIntentCacheSync();

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

            // Check if category is still alive before modifying (may have been removed during async operation)
            if (!isAlive(self)) {
                return;
            }

            const newItems = itemsData.map(
                (item: Item) => {
                    const { id, name, upc } = item;
                    return ItemModel.create({ id, name, upc });
                }
            );
            self.items.clear();
            newItems.forEach((item: ItemType) => self.items.push(item));
            scheduleIntentCacheSync();
        } catch (error) {
            // Only log if category is still alive (avoid errors for dead nodes)
            if (isAlive(self)) {
                console.error(`Error loading category items: ${error}`);
            }
        }
    }),
    syncCategoryItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        // Incrementally sync items: only add/remove what changed to avoid flicker
        try {
            const itemsData = yield api.category.loadCategoryItems({ categoryId: self.id, xAuthUser });

            // Check if category is still alive before modifying (may have been removed during async operation)
            if (!isAlive(self)) {
                return;
            }

            // Create maps for efficient lookup
            const serverItemMap = new Map<string, Item>();
            itemsData.forEach((item: Item) => {
                serverItemMap.set(item.id, item);
            });

            const serverItemIds = new Set(serverItemMap.keys());

            // Double-check before modifying (flow functions automatically handle actions)
            if (!isAlive(self)) {
                return;
            }

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
            scheduleIntentCacheSync();
        } catch (error) {
            // Only log if category is still alive (avoid errors for dead nodes)
            if (isAlive(self)) {
                console.error(`Error syncing category items: ${error}`);
            }
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
