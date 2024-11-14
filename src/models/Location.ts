import { t } from 'mobx-state-tree';

export const LocationModel = t.model('LocationModel', {
    id: t.identifier,
    name: t.string,
    geoLocation: t.maybe(t.string),
    createdBy: t.maybe(t.string),
});