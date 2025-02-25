import { flow, t } from 'mobx-state-tree';
import { ShopperModel } from './Shopper';
import { InviteeModel } from './Invitee';

import { api } from '@/api';
import { InviteeType, IUser, MemberType } from '../DomainStore';
import { Shopper } from 'pantryplus-api-client';

export const GroupModel = t.model('GroupModel', {
    id: t.identifier,
    name: t.string,
    owner: t.late(() => ShopperModel),
    shoppers: t.optional(t.array(t.late(() => ShopperModel)), []),
    invitees: t.optional(t.array(t.late(() => InviteeModel)), []),
})
.views(self => ({
    get members(): MemberType[] {
        return [self.owner, ...(self.shoppers || []), ...(self.invitees || [])];
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
        const shoppers = members.map((member: Shopper) => {
            return ShopperModel.create({ id: member.id, email: member.email, nickname: member.nickname });
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
    addShopperById: flow(function* ({shopperId, user}: {shopperId: string, user: IUser}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.owner.id !== user.id) {
            console.error(`Cannot add shopper as user ${user.id} is not the owner ${self.owner.id} of this group ${groupId}`);
            return;
        }
        yield api.group.addShopperToGroup({ groupId, shopperId, xAuthUser });
        const shopper = yield api.shopper.getShopper({shopperId, xAuthUser}) ;
        self.shoppers?.push(ShopperModel.create({ id: shopper.id, email: shopper.email, nickname: shopper.nickname }));
    }),
    addShopperByEmail: flow(function* ({inviteeEmail, user}: {inviteeEmail: string, user: IUser}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.owner.id !== user.id) {
            console.error(`Cannot invite shopper as user ${user.id} is not the owner ${self.owner.id} of this group ${groupId}`);
            return;
        }
        yield api.group.addInviteeToGroup({ groupId, inviteeEmail, xAuthUser });
        const newInvitee = InviteeModel.create({ email: inviteeEmail });
        self.invitees.push(newInvitee);
    }),
    removeShopper: flow(function* ({shopperId, user}: {shopperId: string, user: IUser}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.owner.id !== user.id) {
            console.error(`Cannot remove shopper as user ${user.id} is not the owner ${self.owner.id} of this group ${groupId}`);
            return;
        }
        yield api.group.removeShopperFromGroup({ groupId, shopperId, xAuthUser });
        const index = self.shoppers?.findIndex(shopper => shopper.id === shopperId);
        if (index !== undefined && index >= 0) {
            self.shoppers?.splice(index, 1);
        }
    }),
    removeInvitee: flow(function* ({shopperEmail, user}: {shopperEmail: string, user: IUser}) {
        const groupId = self.id;
        const xAuthUser = user.email;
        if (self.owner.id !== user.id) {
            console.error(`Cannot remove invitee as user ${user.id} is not the owner ${self.owner.id} of this group ${groupId}`);
            return;
        }
        yield api.group.removeInviteeFromGroup({ groupId, inviteeEmail: shopperEmail, xAuthUser });
        const index = self.invitees?.findIndex(invitee => invitee.email === shopperEmail);
        if (index !== undefined && index >= 0) {
            self.invitees?.splice(index, 1);
        }
    }),
}));