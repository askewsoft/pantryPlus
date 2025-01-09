import { flow, t } from 'mobx-state-tree';
import { ShopperModel } from './Shopper';
import api from '@/api';
import { ShopperType } from '../DomainStore';
 
export const GroupModel = t.model('GroupModel', {
    id: t.identifier,
    name: t.string,
    ownerId: t.string,
    shoppers: t.maybe(t.array(t.late(() => ShopperModel))),
})
.actions(self => ({
    setName: flow(function* ({name, xAuthUser}: {name: string, xAuthUser: string}) {
        const id = self.id;
        const members = self.shoppers?.map(s => s.id) ?? [];
        const ownerId = self.ownerId;
        yield api.group.updateGroup({ name, id, xAuthUser });
    }),
    loadGroupMembers: flow(function* ({xAuthUser}: {xAuthUser: string}) {
        const groupId = self.id;
        const members = yield api.group.getGroupShoppers({ groupId, xAuthUser });
        members.forEach((member: ShopperType) => {
            const memberModel = ShopperModel.create({ id: member.id, email: member.email, nickName: member.nickName });
            self.shoppers?.push(memberModel);
        });
    }),
    addShopperById: flow(function* ({shopperId, xAuthUser}: {shopperId: string, xAuthUser: string}) {
        const groupId = self.id;
        const ownerId = self.ownerId;
        // TODO: Add shopper to Group by id
        // yield api.group.addShopperToGroup({ groupId, shopperId, xAuthUser });
    }),
    addShopperByEmail: flow(function* ({shopperEmail, xAuthUser}: {shopperEmail: string, xAuthUser: string}) {
        const groupId = self.id;
        const ownerId = self.ownerId;
        // TODO: Add shopper to Group by email
        // yield api.group.updateGroup({ group: {id, name, members, ownerId}, xAuthUser });
    }),
    removeShopper: flow(function* ({shopperId, xAuthUser}: {shopperId: string, xAuthUser: string}) {
        const groupId = self.id;
        const ownerId = self.ownerId;
        // TODO: Remove shopper from Group by id
        // yield api.group.updateGroup({ group: {id, name, members, ownerId}, xAuthUser });
    }),
}));