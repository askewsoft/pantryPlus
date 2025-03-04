import { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { DragEndParams } from 'react-native-draggable-flatlist';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ItemsList from './ItemsList';
import { ItemType } from '@/stores/models/List';
import colors from '@/consts/colors';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;
  const currCategory = currList?.categories.find((category) => category.id === categoryId);

  const onDragEnd = ({ data, from, to }: DragEndParams<ItemType>) => {
    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    if (xAuthLocation === '') {
      return;
    } else {
      currCategory?.updateItemOrder({ data, from, to });
    }
  }

  useEffect(() => {
    currCategory?.loadCategoryItems({ xAuthUser });
  }, [xAuthUser]);

  useEffect(() => {
    const animation = Animated.timing(heightAnim, {
      toValue: open ? 1 : 0,
      duration: 250,
      easing: Easing.cubic,
      useNativeDriver: true,
    });
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [open]);

  return (
    <Animated.View style={{
      transform: [{
        scale: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        })
      }],
      opacity: heightAnim,
      overflow: 'hidden',
    }}>
      <ItemsList
        items={currCategory?.items ?? []}
        listId={listId}
        categoryId={categoryId}
        onDragEnd={onDragEnd}
        indent={30}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
    marginTop: 5,
  }
});

export default observer(CategoryItems);