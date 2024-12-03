import { t, Instance, flow } from 'mobx-state-tree';
import { CategoryModel } from './Category';
import api from '@/api';
import { randomUUID } from 'expo-crypto';

export type CategoryType = Instance<typeof CategoryModel>;

// TODO: add an icon per list
export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
    userIsOwner: t.boolean,
    groupId: t.maybe(t.string),
    categories: t.array(CategoryModel),
}).actions(self => ({
    updateListName(name: string): void {
        self.name = name;
    },
    addCategory(name: string): void {
        const newCategory = CategoryModel.create({ id: randomUUID(), name });
        self.categories.push(newCategory);
    },
    removeCategory(categoryId: string): void {
        const index = self.categories?.findIndex(c => c.id === categoryId);
        if (index !== undefined && index !== -1) {
            self.categories!.splice(index, 1);
        }
    },
    updateCategory(category: CategoryType): void {
        const index = self.categories?.findIndex(c => c.id === category.id);
        if (index !== undefined && index !== -1) {
            self.categories![index] = category;
        }
    },
    assignGroupId(groupId: string): void {
        self.groupId = groupId;
    },
    loadCategories: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        const response = yield api.list.getListCategories({ listId: self.id, xAuthUser });
        if (!self.categories) {
            self.categories = t.array(CategoryModel).create([]);
        }
        self.categories.replace(response.data.map(cat => CategoryModel.create(cat)));
    }),
    loadCategoryItems: flow(function*({ listId, categoryId, xAuthUser }: { listId: string, categoryId: string, xAuthUser: string }): Generator<any, any, any> {
        const response = yield api.list.getListCategoryItems({ listId, categoryId, xAuthUser });
        const category = self.categories?.find(c => c.id === categoryId);
        if (category?.items) {
            category.items.replace(response.data);
        }
    })
}));