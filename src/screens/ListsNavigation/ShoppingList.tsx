import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import CategoryFolder from '@/components/CategoryFolder';
import ProductItems from '@/components/ProductItems';
import AddCategoryModal from './modals/AddCategoryModal';

import { uiStore } from '@/stores/UIStore';
import { domainStore, ListType } from '@/stores/DomainStore';

const ShoppingList = ({ route, navigation }: StackPropsShoppingList) => {
  const { selectedShoppingList: listId } = uiStore;
  const currList = domainStore.lists.find((list) => list.id === listId);

  useEffect(() => {
    navigation.setOptions({ title: currList?.name });
    try {
        currList?.loadCategories({ xAuthUser: domainStore.user?.email! });
    } catch (error) {
        console.error('Unable to load categories:', error);
    }
  }, [currList?.id, domainStore.user?.email]);
  /*
  * TODO: see if there is a better way to set the title
  * Results in this error:
  * Warning: Cannot update a component (`StackNavigator`) while rendering a different component (`ShoppingList`)
  */


  return (
    <View style={styles.container}>
      {/* TODO: add a draggable flat list for the categories */}
      {/* Look at MyLists.tsx for reference */}
      {currList?.categories?.map((category) => (
        <CategoryFolder key={category.id} categoryId={category.id} title={category.name}>
          <ProductItems categoryId={category.id} />
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