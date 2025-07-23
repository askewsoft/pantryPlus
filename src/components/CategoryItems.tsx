import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ItemsList from './ItemsList';

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.showCategoryLabels ? (uiStore.openCategories.get(categoryId)?.open ?? false) : true;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;
  const currCategory = currList?.categories.find((category) => category.id === categoryId);

  useEffect(() => {
    currCategory?.loadCategoryItems({ xAuthUser });
  }, [xAuthUser]);

  useEffect(() => {
    const animation = Animated.timing(heightAnim, {
      toValue: open ? 1 : 0,
      duration: 250,
      easing: Easing.cubic,
      useNativeDriver: false,
    });
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [open]);

  return (
    <Animated.View style={{
      maxHeight: heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1000]
      }),
      opacity: heightAnim,
      overflow: 'hidden',
      marginTop: uiStore.showCategoryLabels ? 5 : 0,
    }}>
      <ItemsList
        items={currCategory?.items ?? []}
        listId={listId}
        categoryId={categoryId}
        indent={30}
      />
    </Animated.View>
  );
};

export default observer(CategoryItems);