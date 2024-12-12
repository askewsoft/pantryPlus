import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import CategoryFolder from '@/components/CategoryFolder';
import CategoryItems from '@/components/CategoryItems';
import ListItems from '@/components/ListItems';
import ItemInput from '@/components/ItemInput';
import AddCategoryModal from './modals/AddCategoryModal';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';

const ShoppingList = ({ route, navigation }: StackPropsShoppingList) => {
  const { selectedShoppingList: listId } = uiStore;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;

  useEffect(() => {
    navigation.setOptions({ title: currList?.name });
    currList?.loadCategories({ xAuthUser });
  }, [currList?.id, xAuthUser]);

  return (
    <View style={styles.container}>
      {/* TODO: add a draggable flat list around the listitems and categories */}
      {/* Look at MyLists.tsx for reference */}
      <ItemInput listId={listId!} />
      <ListItems listId={listId!} />
      {currList?.categories?.map((category) => (
        <CategoryFolder key={category.id} categoryId={category.id} title={category.name}>
          <ItemInput categoryId={category.id} />
          <CategoryItems listId={currList.id} categoryId={category.id} />
        </CategoryFolder>
      ))}
      <AddCategoryModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderWidth: 3,
    borderColor: 'blue',
  }
});

export default observer(ShoppingList);