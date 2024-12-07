import { flow, Instance, t } from 'mobx-state-tree';
import api from '@/api';
import { ItemModel } from './Item';
import logging from '@/config/logging';

export type ItemType = Instance<typeof ItemModel>;

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    items: t.array(ItemModel),
}).actions(self => ({
    addItem(item: ItemType): void {
        self.items.push(item);
    },
    setName: flow(function*(name: string, xAuthUser: string): Generator<any, any, any> {
        try {
            yield api.category.updateCategory({ categoryId: self.id, name, xAuthUser });
            self.name = name;
        } catch (error) {
            console.error(`Error setting name: ${error}`);
        }
    }),
}));