import { View, Text, StyleSheet, Button } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';
import { StackPropsMyInvites } from '@/types/GroupNavTypes';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

import { domainStore } from '@/stores/DomainStore';
import logging from '@/config/logging';

const Invite = ({navigation, inviteId}: {navigation: StackPropsMyInvites['navigation'], inviteId: string}) => {
  const invite = domainStore.user?.invites.find(i => i.id === inviteId);
  const user = domainStore.user;

  const onAccept = () => {
    user?.acceptInvite(inviteId).then(() => {
      if (domainStore.user?.invites && domainStore.user?.invites.length <= 1) {
        navigation.goBack();
      }
    });
  }

  const onDecline = () => {
    user?.declineInvite(inviteId);
    if (domainStore.user?.invites && domainStore.user?.invites.length <= 1) {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.cardContainer}>
      <MaterialIcons
        name="message"
        size={fonts.rowIconSize}
        backgroundColor={colors.lightBrandColor}
        color={colors.white}
        style={{ marginTop: 10 }}
      />
      <View style={styles.card}>
        <View style={styles.cardSection}>
          <Text style={styles.cardContent}>
            You are invited by owner &nbsp;
            <Text style={styles.title}>{invite?.owner?.email}</Text>
          </Text>
        </View>
        <View style={styles.cardSection}>
          <Text style={styles.cardContent}>
            to join the group &nbsp;
            <Text style={styles.title}>{invite?.name}</Text>
          </Text> 
        </View>
        <View style={styles.buttonSection}>
          <Button title="Decline" onPress={onDecline} color={colors.brandColor} />
          <Button title="Accept" onPress={onAccept} color={colors.brandColor} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightBrandColor,
    marginTop: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    padding: 5,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.detailsBackground,
    margin: 5,
    padding: 5,
  },
  cardSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cardContent: {
    color: colors.brandColor,
    fontSize: fonts.messageTextSize,
    flexWrap: 'wrap',
  },
  title: {
    color: colors.brandColor,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    fontStyle: 'italic',
    flexWrap: 'wrap',
    marginLeft: 5,
  },
  button: {
    margin: 5,
    backgroundColor: colors.brandColor,
    color: colors.white,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default observer(Invite);