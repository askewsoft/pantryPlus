import { flow, t } from 'mobx-state-tree';

import { api } from '@/api';

export const LocationModel = t.model('LocationModel', {
    id: t.identifier,
    name: t.string,
    latitude: t.maybe(t.number),
    longitude: t.maybe(t.number),
    // API may send null when there is no purchase history
    lastPurchaseDate: t.maybeNull(t.string)
}).views(self => ({
    geoLocation() {
        return {
            latitude: self.latitude,
            longitude: self.longitude
        };
    }
})).actions(self => ({
    setName: flow(function* ({ name, xAuthUser }: { name: string; xAuthUser: string }) {
        yield api.location.updateLocationName({
            locationId: self.id,
            name,
            xAuthUser,
        });
        self.name = name;
    }),
    applyName(name: string) {
        self.name = name;
    },
}));
