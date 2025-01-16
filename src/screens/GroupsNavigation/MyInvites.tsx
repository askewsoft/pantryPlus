import { StyleSheet, View, Text, FlatList } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import Invite from '@/components/Invite';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { StackPropsMyInvites } from '@/types/GroupNavTypes';

const MyInvites = ({navigation}: StackPropsMyInvites) => {
  const renderInvite = ({ item }: { item: any }) => {
    return (
      <Invite navigation={navigation} key={item.id} inviteId={item.id} />
    );
  }

  const invites = domainStore.user?.invites || [];

  return (
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
      />
    </View>
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