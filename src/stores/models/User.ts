import { flow, t } from 'mobx-state-tree';
import api from '@/api';
import { GroupModel } from '@/stores/models/Group';
import { Group } from 'pantryPlusApiClient';

export const UserModel = t
    .model("UserModel",{
        id: t.identifier,
        email: t.string,
        nickName: t.string,
        invites: t.array(t.model({
            id: t.identifier,
            name: t.string,
            owner: t.model({
                id: t.identifier,
                email: t.string,
                nickName: t.string
            })
        }))
    })
    .views(self => ({
        get numInvites(): number {
            return self.invites?.length || 0;
        }
    }))
    .actions(self => ({
        setNickName: (nickName: string) => {
            // TODO: update shopper nickname in DB
            self.nickName = nickName;
        },
        getInvites: flow(function* () {
            const invitesData = yield api.shopper.getUserInvites({ user: self });
            self.invites?.replace(invitesData.map((invite: Group) => GroupModel.create(invite)));
        })
    }));