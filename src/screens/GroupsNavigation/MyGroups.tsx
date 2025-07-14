import { Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";
import { MaterialIcons } from '@expo/vector-icons';

import { domainStore, GroupType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Group from '@/components/Group';
import GroupMembers from '@/components/GroupMembers';
import AddGroupModal from './modals/AddGroupModal';
import ErrorBoundary from '@/components/ErrorBoundary';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

import { StackPropsMyGroups } from '@/types/GroupNavTypes';

const MyGroups = ({navigation}: StackPropsMyGroups) => {
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh invites when screen comes into focus
      domainStore.user?.getInvites();
    });

    return unsubscribe;
  }, [navigation]);

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
        <MaterialIcons name="notifications-active" size={iconSize.rowIconSize} color={'white'} style={{padding: 5}} />
        <Text style={styles.badgeText}>Awaiting Invites: {numInvites}</Text>
      </Pressable>
    );
  }

  const onRefresh = async () => {
    uiStore.setGroupsLoaded(false);
    await domainStore.loadGroups();
    await domainStore.user?.getInvites();
    uiStore.setGroupsLoaded(true);
  }

  return (
    <ErrorBoundary>
      <NestableScrollContainer refreshControl={<RefreshControl refreshing={!uiStore.groupsLoaded} onRefresh={onRefresh} />}>
        {numInvites > 0 && <InviteNotice />}
        <NestableDraggableFlatList
          data={toJS(domainStore.groups)}
          renderItem={renderGroupElement}
          keyExtractor={group => group.id}
        />
        <AddGroupModal navigation={navigation} />
      </NestableScrollContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
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