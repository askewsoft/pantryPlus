import { flow, t } from 'mobx-state-tree';

export const UserModel = t
    .model("UserModel",{
        id: t.identifier,
        email: t.string,
        nickName: t.string,
    });