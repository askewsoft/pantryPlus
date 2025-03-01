import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";
import { ItemType } from '@/stores/models/Category';
import CheckBoxButton from './Buttons/CheckBoxButton';
import RemoveButton from './Buttons/RemoveButton';
import DisassociateButton from './Buttons/DisassociateButton';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';

import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import { FnReturnVoid, FnReturnPromiseVoid } from '@/types/FunctionArgumentTypes';

type ItemProps = {
  item: ItemType;
  onRemoveItem: FnReturnVoid;
  onPurchaseItem: FnReturnPromiseVoid;
  onUncategorizeItem?: FnReturnPromiseVoid;
  drag: FnReturnVoid;
  indent: number;
}

const Item = ({ item, onRemoveItem, onPurchaseItem, onUncategorizeItem, drag, indent }: ItemProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const onPress = () => {
    const newIsChecked = !isChecked;
    setIsChecked(newIsChecked);
    
    const timeoutId = setTimeout(() => {
      if (newIsChecked) {
        onPurchaseItem();
      }
      setTimeoutId(null);
    }, 1500);
    setTimeoutId(timeoutId);
  }

  useEffect(() => {
    if (timeoutId && !isChecked) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId, isChecked]);

  return (
    <ScaleDecorator activeScale={1.04}>
      <SwipeableItem
        key={item.id}
        item={item}
        overSwipe={10}
        snapPointsLeft={[70]}
        renderUnderlayLeft={() => (
          <View style={styles.buttonContainer}>
            {onUncategorizeItem && <DisassociateButton onPress={onUncategorizeItem} />}
            <RemoveButton onPress={onRemoveItem} />
          </View>
        )}
      >
        <View style={[styles.itemLine, { paddingLeft: indent }]}>
          <View style={styles.itemContainer}>
          <CheckBoxButton isChecked={isChecked} onPress={onPress}/>
          <Text style={styles.item}>{item.name}</Text>
        </View>
        <MaterialIcons.Button
          name="drag-indicator"
          size={iconSize.rowIconSize}
          backgroundColor={colors.itemBackground}
          color={colors.brandColor}
          iconStyle={iconStyleStyle}
          style={iconStyle}
          underlayColor={colors.itemBackground}
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
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
  },
  item: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignContent: 'flex-end',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }
});

export default observer(Item);
