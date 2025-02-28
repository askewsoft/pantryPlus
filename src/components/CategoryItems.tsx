import { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Item from './Item';
import { ItemType } from '@/stores/models/List';
import { sortByOrdinal } from '@/stores/utils/sorter';
import colors from '@/consts/colors';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import appConfig from '@/config/app';
const { debug } = appConfig;

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;
  const currCategory = currList?.categories.find((category) => category.id === categoryId);

  const unCategorizeItem = (itemId: string) => {
    return async () => {
      await currCategory?.unCategorizeItem({ itemId, xAuthUser });
      await currList?.removeItem({ itemId, xAuthUser });
    }
  }

  const onRemoveItem = (itemId: string) => {
    return async () => {
      currCategory?.removeItem({ itemId });
      await currList?.removeItem({ itemId, xAuthUser });
    }
  }

  const onPurchaseCategoryItem = (itemId: string) => {
    return async () => {
      const xAuthLocation = domainStore.nearestKnownLocationId ?? '';
      if (xAuthLocation !== '') {
        uiStore.setRecentLocationsNeedRefresh(true);
      }
      // TODO: how do we handle the case where there is no known nearest location?
      if (debug) console.log('onPurchaseCategoryItem', itemId, xAuthLocation, currList?.name);
      if (currList) {
        if (debug) console.log('purchasingCategoryItem', itemId);
        await currList.purchaseItem({ itemId, xAuthUser, xAuthLocation });
        if (debug) console.log('removingCategoryItem', itemId);
        await onRemoveItem(itemId)();
        if (debug) console.log('purchasedCategoryItem', itemId);
      }
    }
  }

  useEffect(() => {
    currCategory?.loadCategoryItems({ xAuthUser });
  }, [xAuthUser]);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: open ? 1 : 0,
      duration: 250,
      easing: Easing.cubic,
      useNativeDriver: false,
    }).start();
  }, [open]);

  const renderItem = ({ item, drag }: { item: ItemType, drag: FnReturnVoid }) => {
    return (
      <Item
        item={item}
        onRemoveItem={onRemoveItem(item.id)}
        onPurchaseItem={onPurchaseCategoryItem(item.id)}
        onUncategorizeItem={unCategorizeItem(item.id)}
        drag={drag}
        indent={30}
      />
    );
  }

  return (
    <Animated.View style={{
      maxHeight: heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1000]
      }),
      overflow: 'hidden',
    }}>
      <NestableDraggableFlatList
        contentContainerStyle={[styles.draggableFlatListStyle]}
        data={toJS(currCategory!.items).sort(sortByOrdinal)}
        onDragEnd={currCategory!.updateItemOrder}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        dragItemOverflow={true}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(CategoryItems);