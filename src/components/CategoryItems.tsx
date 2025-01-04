import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Item from './Item';
import { ItemType } from '@/stores/models/List';
import { sortByOrdinal } from '@/stores/utils/sorter';
import colors from '@/consts/colors';

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;
  const currCategory = currList?.categories.find((category) => category.id === categoryId);

  const onRemoveItem = (itemId: string) => {
    return () => {
      currCategory?.removeItem({ itemId, xAuthUser });
    }
  }

  useEffect(() => {
    currCategory?.loadCategoryItems({ xAuthUser });
  }, [xAuthUser]);

  const renderItem = ({ item, drag }: { item: ItemType, drag: () => void }) => {
    return (
      <Item item={item} onRemoveItem={onRemoveItem(item.id)} drag={drag} indent={30}/>
    );
  }

  return (
    <NestableDraggableFlatList
      contentContainerStyle={[styles.draggableFlatListStyle, { display: open ? 'flex' : 'none' }]}
      data={toJS(currCategory!.items).sort(sortByOrdinal)}
      onDragEnd={currCategory!.updateItemOrder}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      dragItemOverflow={true}
    />
  );
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(CategoryItems);