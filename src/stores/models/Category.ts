import { flow, Instance, t } from 'mobx-state-tree';
import api from '@/api';
import { ItemModel } from './Item';
import { Item } from 'pantryPlusApiClient';

import logging from '@/config/logging';

export type ItemType = Instance<typeof ItemModel>;

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    items: t.array(ItemModel),
}).actions(self => ({
    setName: flow(function*(name: string, xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.category.updateCategory({ categoryId: self.id, name, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
    associateItem: flow(function*({ item, xAuthUser }: { item: ItemType, xAuthUser: string }): Generator<any, any, any> {
        yield api.category.associateCategoryItem({ categoryId: self.id, itemId: item.id, xAuthUser });
        self.items.push(item);
    }),
    loadCategoryItems: flow(function*({ xAuthUser }: { xAuthUser: string }): Generator<any, any, any> {
        const itemsData = yield api.category.loadCategoryItems({ categoryId: self.id, xAuthUser });
        const items = itemsData.map(
            (item: Item) => {
                const { id, name, upc } = item;
                return ItemModel.create({ id, name, upc });
            }
        );
        self.items.replace(items);
    })
}));