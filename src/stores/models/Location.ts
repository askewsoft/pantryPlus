import { t } from 'mobx-state-tree';


export const LocationModel = t.model('LocationModel', {
    id: t.identifier,
    name: t.string,
    latitude: t.maybe(t.number),
    longitude: t.maybe(t.number),
    lastPurchaseDate: t.maybe(t.string)
}).views(self => ({
    geoLocation() {
        return {
            latitude: self.latitude,
            longitude: self.longitude
        };
    }
}));