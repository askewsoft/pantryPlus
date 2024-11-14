import { t } from 'mobx-state-tree';

export const ShopperModel = t
    .model("ShopperModel", {
        id: t.identifier,
        firstName: t.string,
        lastName: t.string,
        email: t.string,
    })
    .views(self => ({
        get fullName() {
            return `${self.firstName} ${self.lastName}`;
        }
    }));