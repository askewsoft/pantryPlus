import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import Invite from '@/components/Invite';
import ErrorBoundary from '@/components/ErrorBoundary';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { StackPropsMyInvites } from '@/types/GroupNavTypes';
import { uiStore } from '@/stores/UIStore';

const MyInvites = ({navigation}: StackPropsMyInvites) => {

  const renderInvite = ({ item }: { item: any }) => {
    return (
      <Invite navigation={navigation} key={item.id} inviteId={item.id} />
    );
  }

  const invites = domainStore.user?.invites || [];

  const onRefresh = async () => {
    await domainStore.user?.getInvites();
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text style={styles.instructions}>
          Only accept invites from email addresses
          that you recognize and trust
        </Text>
        <FlatList
          data={toJS(invites)}
          renderItem={renderInvite}
          keyExtractor={invite => invite.id}
          style={styles.invites}
          refreshControl={
            <RefreshControl 
              refreshing={false} 
              onRefresh={onRefresh}
              colors={[colors.brandColor]}
              tintColor={colors.brandColor}
            />
          }
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.itemBackground,
  },
  instructions: {
    color: colors.white,
    fontSize: fonts.messageTextSize,
    backgroundColor: colors.alertColor,
    padding: 10,
  },
  invites: {
    flex: 1,
    backgroundColor: colors.itemBackground,
    height: '100%',
  },
});

export default observer(MyInvites);