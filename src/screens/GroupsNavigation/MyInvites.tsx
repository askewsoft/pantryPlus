import { StyleSheet, View, Text } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";

import { domainStore } from '@/stores/DomainStore';
import Invite from '@/components/Invite';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const MyInvites = () => {
  const renderInvite = ({ item }: { item: any }) => {
    return (
      <Invite key={item.id} inviteId={item.id} />
    );
  }

  const invites = domainStore.user?.invites || [];

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Only accept invites from email addresses
        that you recognize and trust
      </Text>
      <Invite inviteId={invites[0]?.id} />
      <Invite inviteId={invites[1]?.id} />
    </View>
    // <NestableScrollContainer style={styles.container}>
    //   <NestableDraggableFlatList
    //     data={toJS(domainStore.user?.invites || [])}
    //     renderItem={renderInvite}
    //     keyExtractor={invite => invite.id}
    //   />
    // </NestableScrollContainer>
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
    backgroundColor: colors.lightBrandColor,
    padding: 10,
  },
});

export default observer(MyInvites);