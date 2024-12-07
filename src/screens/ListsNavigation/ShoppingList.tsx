import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import CategoryFolder from '@/components/CategoryFolder';
import CategoryItems from '@/components/CategoryItems';
import AddCategoryModal from './modals/AddCategoryModal';

import { uiStore } from '@/stores/UIStore';
import { domainStore, ListType } from '@/stores/DomainStore';

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
      {/* TODO: add a draggable flat list for the categories */}
      {/* Look at MyLists.tsx for reference */}
      {currList?.categories?.map((category) => (
        <CategoryFolder key={category.id} categoryId={category.id} title={category.name}>
          <CategoryItems listId={currList.id} categoryId={category.id} />
        </CategoryFolder>
      ))}
      <AddCategoryModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default observer(ShoppingList);