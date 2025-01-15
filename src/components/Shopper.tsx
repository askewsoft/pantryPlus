import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SwipeableItem from "react-native-swipeable-item";
import RemoveItemButton from './Buttons/RemoveItemButton';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconStyle } from '@/consts/iconButtons';
import { ShopperType } from '@/stores/DomainStore';

const Shopper = ({ shopper, onRemoveItem, indent }: { shopper: ShopperType, onRemoveItem: () => void, indent: number }) => {
  return (
    <SwipeableItem
      key={shopper.id}
      item={shopper}
      overSwipe={20}
      snapPointsLeft={[70]}
      renderUnderlayLeft={() => (
        <RemoveItemButton onPress={onRemoveItem} />
      )}
    >
      <View style={[styles.itemLine, { paddingLeft: indent }]}>
        <View style={styles.itemContainer}>
          <MaterialIcons
            name="person"
            size={fonts.rowIconSize}
            color={colors.lightBrandColor}
            style={iconStyle}
          />
          <Text style={styles.item}>{shopper.nickName}</Text>
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

export default observer(Shopper);
