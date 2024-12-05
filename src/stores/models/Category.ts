import { Instance, t } from 'mobx-state-tree';
import { ItemModel } from './Item';

export type ItemType = Instance<typeof ItemModel>;

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    items: t.array(ItemModel),
}).actions(self => ({
    addItem(item: ItemType): void {
        self.items.push(item);
    },
}));
