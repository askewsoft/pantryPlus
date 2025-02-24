import { useEffect, useState } from 'react';
import { StyleSheet, RefreshControl, Alert } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import CategoryFolder from '@/components/CategoryFolder';
import CategoryItems from '@/components/CategoryItems';
import ListItems from '@/components/ListItems';
import ItemInput from '@/components/ItemInput';
import AddCategoryModal from './modals/AddCategoryModal';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import { CategoryType } from '@/stores/models/List';
import colors from '@/consts/colors';
import { sortByOrdinal } from '@/stores/utils/sorter';

const ShoppingList = ({ navigation }: StackPropsShoppingList) => {
  const listId = uiStore.selectedShoppingList;
  const xAuthUser = domainStore.user?.email!;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    const currList = domainStore.lists.find((list) => list.id === listId) || domainStore.lists[0];
    if (!currList) return;
    
    navigation.setOptions({ title: currList.name });
    
    // Always load categories and items on initial mount or refresh
    try {
      await currList.loadCategories({ xAuthUser });
      await currList.loadListItems({ xAuthUser });
    } catch (error) {
      console.error('Problem in ShoppingList loading Categories or Items:', error);
      if (!currList.categories.length && !currList.items.length) {
        Alert.alert('Network Error', 'Unable to load data. Please try refreshing.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderCategoryElement = ({ item, drag }: { item: CategoryType, drag: () => void }) => {
    const categoryId = item.id;
    return (
        <CategoryFolder key={categoryId} categoryId={categoryId} title={item.name} drag={drag}>
          <ItemInput categoryId={categoryId} />
          <CategoryItems listId={listId || ''} categoryId={categoryId} />
        </CategoryFolder>
    );
  }

  const getCurrentCategories = () => {
    const currList = domainStore.lists.find((list) => list.id === listId) || domainStore.lists[0];
    return currList ? toJS(currList.categories).sort(sortByOrdinal) : [];
  }

  const onDragEnd = ({ data }: DragEndParams<CategoryType>) => {
    const currList = domainStore.lists.find((list) => list.id === listId) || domainStore.lists[0];
    data.forEach((category, index) => {
      if (category.ordinal !== index) {
          /* each category in data is a copy of the CategoryModel's properties only
          * It is not an instance of CategoryModel and lacks actions & views
          * We must find the CategoryModel instance to execute the self-mutating action
          */
          const updatedCategory = currList!.categories.find(c => c.id === category.id);
          updatedCategory!.setOrdinal(index, xAuthUser);
      }
    });
  }

  // Load data on mount and when list changes
  useEffect(() => {
    if (listId && domainStore.user && uiStore.listsLoaded) {
      // loadData();
      const currList = domainStore.lists.find((list) => list.id === listId) || domainStore.lists[0];
      console.log('ShoppingList mount/update:', { lists: domainStore.lists.length, listId, id: domainStore.lists[0].id, groceryItems: currList.items.length, groceryCategories: currList.categories.length });
      navigation.setOptions({ title: currList.name });
    }
  }, [listId, uiStore.listsLoaded, domainStore.user]);

  return (
    <NestableScrollContainer 
      style={styles.container} 
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={loadData}
        />
      }
    >
      <ItemInput listId={listId || ''} />
      <ListItems listId={listId || ''} />
      <NestableDraggableFlatList
        contentContainerStyle={styles.draggableFlatListStyle}
        data={getCurrentCategories()}
        renderItem={renderCategoryElement}
        keyExtractor={category => category.id}
        onDragEnd={onDragEnd}
      />
      <AddCategoryModal />
    </NestableScrollContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(ShoppingList);