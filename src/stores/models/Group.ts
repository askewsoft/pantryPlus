import { t } from 'mobx-state-tree';
import { ShopperModel } from './Shopper';

export const GroupModel = t.model('GroupModel', {
    id: t.identifier,
    name: t.string,
    userIsOwner: t.boolean,
    shoppers: t.maybe(t.array(t.late(() => ShopperModel))),
});