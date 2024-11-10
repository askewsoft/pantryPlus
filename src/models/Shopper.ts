import { t } from 'mobx-state-tree';

export const ShopperModel = t
    .model("ShopperModel", {
        id: t.optional(t.string, ''),
        firstName: t.optional(t.string, ''),
        lastName: t.optional(t.string, ''),
        email: t.optional(t.string, ''),
    })
    .views(self => ({
        get fullName() {
            return `${self.firstName} ${self.lastName}`;
        }
    }));