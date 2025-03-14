import { t } from 'mobx-state-tree';

export const ShopperModel = t
    .model("ShopperModel", {
        id: t.identifier,
        nickname: t.string,
        email: t.string,
    });