import { Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";
import { MaterialIcons } from '@expo/vector-icons';

import { domainStore, GroupType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Group from '@/components/Group';
import GroupMembers from '@/components/GroupMembers';
import AddGroupModal from './modals/AddGroupModal';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { StackPropsMyGroups } from '@/types/GroupNavTypes';

const MyGroups = ({navigation}: StackPropsMyGroups) => {
  const numInvites = domainStore.user?.numInvites || 0;

  const onPressInvites = () => {
    navigation.navigate('MyInvites');
  }

  const renderGroupElement = ({ item }: { item: GroupType }) => {
    const group = domainStore.groups.find(g => g.id === item.id);
    const userIsGroupOwner = group?.owner.email === domainStore.user?.email;
    return (
      <Group key={group!.id} groupId={group!.id} title={group!.name} userIsGroupOwner={userIsGroupOwner}>
        <GroupMembers groupId={group!.id} userIsGroupOwner={userIsGroupOwner} />
      </Group>
    );
  }

  const InviteNotice = () => {
    return (
      <Pressable onPress={onPressInvites} style={styles.inviteBadge}>
        <MaterialIcons name="notifications-active" size={fonts.rowIconSize} color={'white'} style={{padding: 5}} />
        <Text style={styles.badgeText}>Awaiting Invites: {numInvites}</Text>
      </Pressable>
    );
  }

  const onRefresh = async () => {
    uiStore.setGroupsLoaded(false);
    await domainStore.loadGroups();
    uiStore.setGroupsLoaded(true);
  }

  return (
    <NestableScrollContainer style={styles.container} refreshControl={<RefreshControl refreshing={!uiStore.groupsLoaded} onRefresh={onRefresh} />}>
      {numInvites > 0 && <InviteNotice />}
      <NestableDraggableFlatList
        data={toJS(domainStore.groups)}
        renderItem={renderGroupElement}
        keyExtractor={group => group.id}
      />
      <AddGroupModal navigation={navigation} />
    </NestableScrollContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  inviteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.alertColor,
  },
  badgeText: {
    color: colors.white,
    fontSize: fonts.badgeTextSize,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default observer(MyGroups);