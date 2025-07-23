import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ItemType } from '@/stores/models/Category';
import CheckBoxButton from './Buttons/CheckBoxButton';
import ItemContextMenu from './ContextMenus/ItemContextMenu';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { useItemActions } from '@/hooks/useItemActions';
import { uiStore } from '@/stores/UIStore';

type ItemProps = {
  item: ItemType;
  listId: string;
  categoryId?: string;
  indent: number;
}

const Item = ({ 
  item, 
  listId,
  categoryId,
  indent,
}: ItemProps) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const isCheckedRef = useRef(item.isChecked);

  const { setIsChecked, onRemoveItem, handlePurchase } = useItemActions({
    itemId: item.id,
    listId,
    categoryId,
  });

  const onAssignToCategory = () => {
    uiStore.setAddItemToCategoryID(categoryId ?? null);
    uiStore.setAddItemModalVisible(true);
  }

  const onPress = () => {
    const newIsChecked = !item.isChecked;
    isCheckedRef.current = newIsChecked;
    setIsChecked(newIsChecked);
 
    if (newIsChecked) {
      const timeoutId = setTimeout(() => {
        // Only process if the item is still checked after the timeout
        if (isCheckedRef.current) {
          handlePurchase();
        }
        setTimeoutId(null);
      }, 3000);
      setTimeoutId(timeoutId);
    } else {
      // If unchecking, clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  }

  useEffect(() => {
    // Update ref when item.isChecked changes
    isCheckedRef.current = item.isChecked;
    
    if (timeoutId && !item.isChecked) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId, item.isChecked]);

  return (
    <View style={[styles.itemLine, { paddingLeft: indent }]}>
      <View style={styles.itemContainer}>
        <CheckBoxButton isChecked={item.isChecked} onPress={onPress}/>
        <Text style={styles.item}>{item.name}</Text>
      </View>
      <ItemContextMenu
        onRemove={onRemoveItem}
        onAssignToCategory={onAssignToCategory}
      />
    </View>
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
  }
});

export default observer(Item);
