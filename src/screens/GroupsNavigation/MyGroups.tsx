import { StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";
import { domainStore, GroupType } from '@/stores/DomainStore';
import Group from '@/components/Group';
import GroupMembers from '@/components/GroupMembers';
import AddGroupModal from './modals/AddGroupModal';
import logging from '@/config/logging';

const MyGroups = () => {
  const renderGroupElement = ({ item }: { item: GroupType }) => {
    logging.debug ? console.log(`renderGroupElement - item: ${JSON.stringify(item)}`) : null;
    const group = domainStore.groups.find(g => g.id === item.id);
    return (
      <Group key={group!.id} groupId={group!.id} title={group!.name}>
        <GroupMembers groupId={group!.id} />
      </Group>
    );
  }

  return (
    <NestableScrollContainer style={styles.container}>
      <NestableDraggableFlatList
        data={toJS(domainStore.groups)}
        renderItem={renderGroupElement}
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

export default observer(MyGroups);