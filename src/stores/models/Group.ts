import { flow, t } from 'mobx-state-tree';
import { ShopperModel } from './Shopper';
import api from '@/api';
import { ShopperType, UserType } from '../DomainStore';
 
export const GroupModel = t.model('GroupModel', {
    id: t.identifier,
    name: t.string,
    ownerId: t.string,
    shoppers: t.maybe(t.array(t.late(() => ShopperModel))),
})
.actions(self => ({
    setName: flow(function* ({name, xAuthUser}: {name: string, xAuthUser: string}) {
        const id = self.id;
        yield api.group.updateGroup({ name, id, xAuthUser });
        self.name = name;
    }),
    loadGroupMembers: flow(function* ({xAuthUser}: {xAuthUser: string}) {
        const groupId = self.id;
        const members = yield api.group.getGroupShoppers({ groupId, xAuthUser });
        members.forEach((member: ShopperType) => {
            const memberModel = ShopperModel.create({ id: member.id, email: member.email, nickName: member.nickName });
            self.shoppers?.push(memberModel);
        });
    }),
    addShopperById: flow(function* ({shopperId, user}: {shopperId: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot add shopper as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.addShopperToGroup({ groupId, shopperId, xAuthUser });
    }),
    addShopperByEmail: flow(function* ({shopperEmail, user}: {shopperEmail: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot invite shopper as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.inviteShopperToGroup({ groupId, shopperEmail, xAuthUser });
    }),
    removeShopper: flow(function* ({shopperId, user}: {shopperId: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot remove shopper as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.removeShopperFromGroup({ groupId, shopperId, xAuthUser });
    }),
    removeInvitee: flow(function* ({shopperEmail, user}: {shopperEmail: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot remove invitee as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.removeInviteeFromGroup({ groupId, shopperEmail, xAuthUser });
    }),
}));