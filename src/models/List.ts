import { t } from 'mobx-state-tree';
import { CategoryModel } from './Category';

export const ListModel = t.model('ListModel', {
    id: t.identifier,
    name: t.string,
    userIsOwner: t.boolean,
    groupId: t.maybe(t.string),
    categories: t.maybe(t.array(t.late(() => CategoryModel))),
});