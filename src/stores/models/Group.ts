import { flow, t } from 'mobx-state-tree';
import { ShopperModel } from './Shopper';
import { InviteeModel } from './Invitee';

import api from '@/api';
import { InviteeType, ShopperType, UserType, MemberType } from '../DomainStore';
 
export const GroupModel = t.model('GroupModel', {
    id: t.identifier,
    name: t.string,
    ownerId: t.string,
    shoppers: t.maybe(t.array(t.late(() => ShopperModel))),
    invitees: t.maybe(t.array(t.late(() => InviteeModel))),
})
.views(self => ({
    get members(): MemberType[] {
        return [...(self.shoppers || []), ...(self.invitees || [])];
    }
}))
.actions(self => ({
    setName: flow(function* ({name, xAuthUser}: {name: string, xAuthUser: string}) {
        const id = self.id;
        yield api.group.updateGroup({ name, id, xAuthUser });
        self.name = name;
    }),
    loadGroupShoppers: flow(function* ({xAuthUser}: {xAuthUser: string}) {
        const groupId = self.id;
        const members = yield api.group.getGroupShoppers({ groupId, xAuthUser });
        const shoppers = members.map((member: ShopperType) => {
            return ShopperModel.create({ id: member.id, email: member.email, nickName: member.nickName });
        });
        self.shoppers?.replace(shoppers);
    }),
    loadGroupInvitees: flow(function* ({xAuthUser}: {xAuthUser: string}) {
        const groupId = self.id;
        const invitedMembers = yield api.group.getGroupInvitees({ groupId, xAuthUser });
        const invitees = invitedMembers.map((invitee: InviteeType) => {
            return InviteeModel.create({ email: invitee.email });
        });
        self.invitees?.replace(invitees);
    }),
    addShopperById: flow(function* ({shopperId, user}: {shopperId: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot add shopper as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.addShopperToGroup({ groupId, shopperId, xAuthUser });
        const shopper = yield api.shopper.getShopper({shopperId, xAuthUser}) ;
        self.shoppers?.push(ShopperModel.create({ id: shopper.id, email: shopper.email, nickName: shopper.nickName }));
    }),
    addShopperByEmail: flow(function* ({inviteeEmail, user}: {inviteeEmail: string, user: UserType}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.ownerId !== user.id) {
            console.error(`Cannot invite shopper as user ${user.id} is not the owner ${self.ownerId} of this group ${groupId}`);
            return;
        }
        yield api.group.addInviteeToGroup({ groupId, inviteeEmail, xAuthUser });
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