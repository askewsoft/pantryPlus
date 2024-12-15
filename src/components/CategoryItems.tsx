import { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Item from './Item';

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;
  const currCategory = currList?.categories.find((category) => category.id === categoryId);
  currCategory?.loadCategoryItems({ xAuthUser });

  return <FlatList style={[styles.container, { display: open ? 'flex' : 'none' }]}
    data={currList?.categories.find((category) => category.id === categoryId)?.items}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <Item item={item} />
    )}
  />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  }
});

export default observer(CategoryItems);
