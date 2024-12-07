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
    addCategory: flow(function*({ name, xAuthUser }: { name: string, xAuthUser: string }): Generator<any, any, any> {
        const newCategory = CategoryModel.create({ id: randomUUID(), name });
        yield api.list.addListCategory({ listId: self.id, category: {...newCategory, listId: self.id}, xAuthUser });
        self.categories.push(newCategory);
    }),
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
        const categories = yield api.list.getListCategories({ listId: self.id, xAuthUser });
        self.categories.replace(categories);
    }),
    loadCategoryItems: flow(function*({ categoryId, xAuthUser }: { categoryId: string, xAuthUser: string }): Generator<any, any, any> {
        const categoryItems = yield api.list.getListCategoryItems({ listId: self.id, categoryId, xAuthUser });
        const category = self.categories?.find(c => c.id === categoryId);
        if (category?.items) {
            category.items.replace(categoryItems);
        }
    })
}));