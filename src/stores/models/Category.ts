import { t } from 'mobx-state-tree';
import { ItemModel } from './Item';

export const CategoryModel = t.model('CategoryModel', {
    id: t.identifier,
    name: t.string,
    items: t.maybe(t.array(t.late(() => ItemModel))),
});