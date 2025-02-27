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
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import { FnReturnVoid, FnReturnPromiseVoid } from '@/types/FunctionArgumentTypes';

import appConfig from '@/config/app';
const { debug } = appConfig;

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
    if (debug) console.log('before onPress', item.name, isChecked);
    const newIsChecked = !isChecked;
    setIsChecked(newIsChecked);
    if (debug) console.log('after onPress', item.name, newIsChecked);
    
    const timeoutId = setTimeout(() => {
      if (newIsChecked) {
        if (debug) console.log('setTimeout inside isChecked', JSON.stringify({ item: item.name, newIsChecked }));
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
  },
  buttonContainer: {
    flexDirection: 'row',
    alignContent: 'flex-end',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }
});

export default observer(Item);
