import { t } from 'mobx-state-tree';

export const ShopperModel = t
    .model("ShopperModel", {
        id: t.identifier,
        nickName: t.string,
        email: t.string,
    });