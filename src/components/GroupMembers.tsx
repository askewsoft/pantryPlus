import { StyleSheet, FlatList } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { getType, isStateTreeNode } from 'mobx-state-tree';

import { domainStore, InviteeType, ShopperType, MemberType } from '@/stores/DomainStore';
import Shopper from '@/components/Shopper';
import Invitee from '@/components/Invitee';
import Owner from '@/components/Owner';
import colors from '@/consts/colors';

const GroupMembers = ({ groupId, userIsGroupOwner }: { groupId: string, userIsGroupOwner: boolean }) => {
  const currGroup = domainStore.groups.find(g => g.id === groupId);

  const onRemoveShopper = (shopperId: string) => {
    return () => {
      currGroup?.removeShopper({ shopperId, user: domainStore.user! });
    }
  }

  const onRemoveInvitee = (inviteeEmail: string) => {
    return () => {
      currGroup?.removeInvitee({ shopperEmail: inviteeEmail.trim().toLowerCase(), user: domainStore.user! });
    }
  }

  const renderMember = ({ item: member }: { item: MemberType }) => {
      if (typeof member !== 'undefined' && isStateTreeNode(member)) {
        const nodeType = getType(member);
        if (nodeType.name === 'ShopperModel') {
          if (member.email === currGroup?.owner.email) {
            return renderOwner(member as ShopperType);
          } else {
            return renderShopper(member as ShopperType);
          }
        } else if (nodeType.name === 'InviteeModel') {
          return renderInvitee(member as InviteeType);
        }
      }
      return null;
  }

  const renderShopper = (member: ShopperType) => {
    return (
      <Shopper shopper={member} onRemoveShopper={onRemoveShopper(member.id)} indent={30} userIsGroupOwner={userIsGroupOwner}/>
    );
  }

  const renderInvitee = (member: InviteeType) => {
    return (
      <Invitee invitee={member} onRemoveInvitee={onRemoveInvitee(member.email)} indent={30} userIsGroupOwner={userIsGroupOwner}/>
    );
  }

  const renderOwner = (member: ShopperType) => {
    return (
      <Owner owner={member} indent={30} />
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.draggableFlatListStyle]}
      data={toJS(currGroup!.members)}
      renderItem={renderMember}
      keyExtractor={(member) => member.email}
    />
  );
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(GroupMembers);