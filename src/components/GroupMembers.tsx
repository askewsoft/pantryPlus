import { useEffect } from 'react';
import { StyleSheet, FlatList, Text } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { getType, isStateTreeNode } from 'mobx-state-tree';

import { domainStore, InviteeType, ShopperType, MemberType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Shopper from '@/components/Shopper';
import Invitee from '@/components/Invitee';
import colors from '@/consts/colors';

const GroupMembers = ({ groupId }: { groupId: string }) => {
  const currGroup = domainStore.groups.find(g => g.id === groupId);
  const xAuthUser = domainStore.user?.email!;

  const onRemoveItem = (shopperId: string) => {
    return () => {
      // currGroup?.removeShopper({ shopperId, xAuthUser });
    }
  }

  useEffect(() => {
    currGroup?.loadGroupShoppers({ xAuthUser });
    currGroup?.loadGroupInvitees({ xAuthUser });
  }, [xAuthUser, groupId]);

  const renderMember = ({ member }: { member: MemberType }) => {
    console.log('Member:', JSON.stringify(member));
    if (isStateTreeNode(member)) {
      const nodeType = getType(member);
      console.log('MST type:', JSON.stringify(nodeType)); // This will log the MST type name
      if (nodeType.name === 'ShopperModel') {
        return renderShopper(member);
      } else {
        return renderInvitee(member);
      }
    } else {
      return <Text>Unknown member type</Text>;
    }
  }

  const renderShopper = (member: ShopperType) => {
    return (
      <Shopper shopper={member} onRemoveItem={onRemoveItem(member.id)} indent={30}/>
    );
  }

  const renderInvitee = (member: InviteeType) => {
    return (
      <Invitee invitee={member} onRemoveItem={onRemoveItem(member.email)} indent={30} />
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.draggableFlatListStyle]}
      data={toJS(currGroup!.members)}
      renderItem={renderMember as any}
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