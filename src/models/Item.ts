import { t } from 'mobx-state-tree';

export const ItemModel = t.model('ItemModel', {
    id: t.identifier,
    name: t.string,
    upc: t.maybe(t.string),
});