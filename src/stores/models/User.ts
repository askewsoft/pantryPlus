import { flow, t } from 'mobx-state-tree';
import api from '@/api';
import { GroupModel } from '@/stores/models/Group';
import { Group } from 'pantryPlusApiClient';
import logging from '@/config/logging';

export const UserModel = t
    .model("UserModel",{
        id: t.identifier,
        email: t.string,
        nickname: t.string,
        invites: t.optional(t.array(t.late(() => GroupModel)), [])
    })
    .views(self => ({
        get numInvites(): number {
            return self.invites.length || 0;
        }
    }))
    .actions(self => ({
        setNickName: (nickname: string) => {
            // TODO: update shopper nickname in DB
            self.nickname = nickname;
        },
        getInvites: flow(function* () {
            const invitesData = yield api.shopper.getUserInvites({ user: self });
            self.invites.replace(invitesData.map((invite: Group) => GroupModel.create(invite)));
        }),
        acceptInvite: flow(function* (inviteId: string) {
            const xAuthUser = self.email!;
            const shopperId = self.id!;
            yield api.shopper.acceptInvite({ xAuthUser, shopperId, inviteId });
            self.invites.replace(self.invites.filter(invite => invite.id !== inviteId));
        }),
        declineInvite: flow(function* (inviteId: string) {
            const xAuthUser = self.email!;
            const shopperId = self.id!;
            yield api.shopper.declineInvite({ xAuthUser, shopperId, inviteId });
            self.invites.replace(self.invites.filter(invite => invite.id !== inviteId));
        })
    }));