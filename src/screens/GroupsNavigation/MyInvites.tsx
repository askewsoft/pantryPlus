import { Text, StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";

import { domainStore, GroupType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Group from '@/components/Group';
import GroupMembers from '@/components/GroupMembers';
import AddGroupModal from './modals/AddGroupModal';
import logging from '@/config/logging';

const MyInvites = () => {
  if (!uiStore.groupsLoaded) {
    return <Text>Loading...</Text>;
  }
  const renderInvite = ({ item }: { item: any }) => {
    const invite = domainStore.groups.find(g => g.id === item.id);
    return (
      <Group key={invite!.id} groupId={invite!.id} title={invite!.name}>
        {<Text>Inviter: {invite!.owner.email}</Text>}
      </Group>
    );
  }

  return (
    <NestableScrollContainer style={styles.container}>
      <NestableDraggableFlatList
        data={toJS(domainStore.user?.invites || [])}
        renderItem={renderInvite}
        keyExtractor={group => group.id}
      />
      <AddGroupModal />
    </NestableScrollContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  }
});

export default observer(MyInvites);