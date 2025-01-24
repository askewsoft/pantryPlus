import { t } from 'mobx-state-tree';

export const InviteeModel = t.model("InviteeModel", {
    email: t.string,
});