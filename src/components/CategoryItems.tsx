import { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ProductItem from './ProductItem';
import { randomUUID } from 'expo-crypto';

const CategoryItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find((list) => list.id === listId);

  useEffect(() => {
    currList?.loadCategoryItems({ categoryId, xAuthUser: domainStore.user?.email! });
  }, [categoryId, domainStore.user?.email]);

  return <FlatList style={[styles.container, { display: open ? 'flex' : 'none' }]}
    // data={currList?.categories.find((category) => category.id === categoryId)?.items}
    data={[{ name: 'Pepperoni', id: randomUUID(), upc: undefined }, { name: 'Cheese', id: randomUUID(), upc: undefined }]}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <ProductItem item={item} isEditing={false} />
    )}
  />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  }
});

export default observer(CategoryItems);
