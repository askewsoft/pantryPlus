import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";
import { ItemType } from '@/stores/models/Category';
import CheckBoxButton from './Buttons/CheckBoxButton';
import RemoveButton from './Buttons/RemoveButton';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const Item = ({ item, onRemoveItem, drag, indent }: { item: ItemType, onRemoveItem: () => void, drag: () => void, indent: number }) => {
  return (
    <ScaleDecorator activeScale={1.04}>
      <SwipeableItem
        key={item.id}
        item={item}
        overSwipe={20}
        snapPointsLeft={[70]}
        renderUnderlayLeft={() => (
          <RemoveButton onPress={onRemoveItem} />
        )}
      >
        <View style={[styles.itemLine, { paddingLeft: indent }]}>
          <View style={styles.itemContainer}>
          <CheckBoxButton />
          <Text style={styles.item}>{item.name}</Text>
        </View>
        <MaterialIcons.Button
          name="drag-indicator"
          size={fonts.rowIconSize}
          backgroundColor={colors.itemBackground}
          color={colors.brandColor}
          iconStyle={iconStyleStyle}
          style={iconStyle}
          underlayColor={colors.lightBrandColor}
          onLongPress={drag}
          />
        </View>
      </SwipeableItem>
    </ScaleDecorator>
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
  }
});

export default observer(Item);
