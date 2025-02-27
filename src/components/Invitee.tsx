import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SwipeableItem from "react-native-swipeable-item";
import RemoveButton from './Buttons/RemoveButton';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconStyle } from '@/consts/iconButtons';
import { InviteeType } from '@/stores/DomainStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const Invitee = ({ invitee, indent, userIsGroupOwner, onRemoveInvitee }: { invitee: InviteeType, indent: number, userIsGroupOwner: boolean, onRemoveInvitee: FnReturnVoid }) => {
  return (
    <SwipeableItem
      key={invitee.email}
      item={invitee}
      overSwipe={20}
      snapPointsLeft={[70]}
      renderUnderlayLeft={() => (
        <RemoveButton onPress={onRemoveInvitee} />
      )}
      swipeEnabled={userIsGroupOwner}
    >
      <View style={[styles.itemLine, { paddingLeft: indent }]}>
        <View style={styles.itemContainer}>
          <MaterialIcons
            name="person-outline"
            size={fonts.rowIconSize}
            color={colors.lightBrandColor}
            style={iconStyle}
          />
          <Text style={styles.item}>{invitee.email}</Text>
        </View>
      </View>
    </SwipeableItem>
  );
};

const styles = StyleSheet.create({
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
    borderWidth: 1,
    borderColor: 'white',
  },
  itemContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
  },
  item: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
    padding: 10
  }
});

export default observer(Invitee);