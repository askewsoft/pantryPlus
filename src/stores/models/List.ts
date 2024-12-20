import { t, Instance, flow } from 'mobx-state-tree';

import api from '@/api';

import { CategoryModel } from './Category';
import { ItemModel } from './Item';

import logging from '@/config/logging';

import { randomUUID } from 'expo-crypto';
import { Category, Item } from 'pantryPlusApiClient';

export type ItemType = Instance<typeof ItemModel>;
export type CategoryType = Instance<typeof CategoryModel>;

export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
    ordinal: t.number, // zero-based index
    userIsOwner: t.boolean,
    groupId: t.maybe(t.string),
    categories: t.array(CategoryModel),
    items: t.array(ItemModel),
}).actions(self => ({
    updateListName(name: string): void {
        self.name = name;
    },
    addCategory: flow(function*({ name, xAuthUser }: { name: string, xAuthUser: string }): Generator<any, any, any> {
        const newCategoryId = randomUUID();
        const ordinal = self.categories.length;
        const newCategory = CategoryModel.create({ id: newCategoryId, name, ordinal });
        yield api.list.addListCategory({ listId: self.id, category: {name, id: newCategoryId}, xAuthUser });
        self.categories.push(newCategory);
    }),
    removeCategory(categoryId: string): void {
        const index = self.categories?.findIndex(c => c.id === categoryId);
        if (index !== undefined && index !== -1) {
            self.categories!.splice(index, 1);
        }
    },
    assignGroupId(groupId: string): void {
        // TODO: add this to backend
        self.groupId = groupId;
    },
    loadCategories: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        const categoriesData = yield api.list.getListCategories({ listId: self.id, xAuthUser });
        const categories = categoriesData.map(
            (category: Category) => {
                const { id, name, ordinal } = category;
                return CategoryModel.create({ id, name, ordinal: ordinal ?? -1 });
            }
        );

        // Load items for each category, before replacing categories array
        for (const category of categories) {
            yield category.loadCategoryItems({ xAuthUser });
        }

        // Now replace categories array
        // self.categories.clear();
        self.categories.replace(categories);
    }),
    loadListItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        const itemsData = yield api.list.getListItems({ listId: self.id, xAuthUser });
        const items = itemsData.map(
            (item: Item, index: number) => {
                const { id, name, upc } = item;
                return ItemModel.create({ id, name, upc, ordinal: index });
            }
        );
        self.items.spliceWithArray(0, self.items.length, items);
    }),
    addItem: flow(function*({ item, xAuthUser }: { item: Pick<ItemType, 'name' | 'upc'>, xAuthUser: string }): Generator<any, any, any> {
        const newItemId = randomUUID();
        const newItem = ItemModel.create({ id: newItemId, name: item.name, upc: item.upc, ordinal: self.items.length });
        yield newItem.saveItem(xAuthUser);
        yield api.list.associateListItem({ listId: self.id, itemId: newItemId, xAuthUser });
        self.items.push(newItem);
    }),
    associateItemToList: flow(function*({ item, xAuthUser }: { item: Item, xAuthUser: string }): Generator<any, any, any> {
        yield api.list.associateListItem({ listId: self.id, itemId: item.id, xAuthUser });
        self.items.push(item);
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
    setOrdinal(ordinal: number): void {
        // TODO: update ordinal in backend
        self.ordinal = ordinal;
    },
}));
