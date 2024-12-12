import { t, Instance, flow } from 'mobx-state-tree';

import api from '@/api';

import { CategoryModel } from './Category';
import { ItemModel } from './Item';

import { randomUUID } from 'expo-crypto';
import { Category, Item } from 'pantryPlusApiClient';

export type CategoryType = Instance<typeof CategoryModel>;

export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
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
        const newCategory = CategoryModel.create({ id: newCategoryId, name });
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
                const { id, name } = category;
                return CategoryModel.create({ id, name });
            }
        );
        self.categories.replace(categories);
    }),
    loadListItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        const itemsData = yield api.list.getListItems({ listId: self.id, xAuthUser });
        const items = itemsData.map(
            (item: Item) => {
                const { id, name, upc } = item;
                return ItemModel.create({ id, name, upc });
            }
        );
        self.items.replace(items);
    }),
    associateItemToList: flow(function*({ itemId, xAuthUser }: { itemId: string, xAuthUser: string }): Generator<any, any, any> {
        yield api.list.associateListItem({ listId: self.id, itemId, xAuthUser });
    })
}));