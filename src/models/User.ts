import { t } from 'mobx-state-tree';

export const UserModel = t
    .model("UserModel",{
        email: t.string,
        id: t.identifier,
        nickname: t.optional(t.string, ''),
        firstName: t.maybe(t.string),
        lastName: t.maybe(t.string),
    });