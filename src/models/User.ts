import { t } from 'mobx-state-tree';

export const UserModel = t
    .model("UserModel",{
        email: t.optional(t.frozen(t.string), ''),
        sub: t.optional(t.frozen(t.string), ''),
        nickname: t.optional(t.frozen(t.string), ''),
    });