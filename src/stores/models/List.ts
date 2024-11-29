import { t, Instance } from 'mobx-state-tree';
import { CategoryModel } from './Category';

export type CategoryType = Instance<typeof CategoryModel>;

// TODO: add an icon per list
export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
    userIsOwner: t.boolean,
    groupId: t.maybe(t.string),
    categories: t.maybe(t.array(t.late(() => CategoryModel))),
}).actions(self => ({
    updateListName(name: string) {
        self.name = name;
    },
    addCategory(category: CategoryType) {
        self.categories?.push(category);
    },
    removeCategory(categoryId: string) {
        const index = self.categories?.findIndex(c => c.id === categoryId);
        if (index !== undefined && index !== -1) {
            self.categories!.splice(index, 1);
        }
    },
    updateCategory(category: CategoryType) {
        const index = self.categories?.findIndex(c => c.id === category.id);
        if (index !== undefined && index !== -1) {
            self.categories![index] = category;
        }
    },
    assignGroupId(groupId: string) {
        self.groupId = groupId;
    }
}));