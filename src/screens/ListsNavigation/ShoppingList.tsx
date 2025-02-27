import { useEffect, useState } from 'react';
import { StyleSheet, RefreshControl, Alert } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';
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

const ShoppingList = observer(({ navigation }: StackPropsShoppingList) => {
  const listId = uiStore.selectedShoppingList;
  const xAuthUser = domainStore.user?.email;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get current list as a computed value and ensure it exists
  const currentList = domainStore.lists.find((list) => list.id === listId);

  const loadData = async () => {
    // Verify list still exists in store before loading
    const listStillExists = domainStore.lists.find((list) => list.id === listId);
    if (!listStillExists || !xAuthUser) return;
    
    setIsRefreshing(true);
    try {
      // Create a reference to the current list's ID to verify it hasn't changed
      const loadingListId = listId;
      
      // Verify list ID hasn't changed before each operation
      if (loadingListId === uiStore.selectedShoppingList) {
        const xAuthLocation = domainStore.nearestKnownLocationId ?? '';
        await listStillExists.loadCategories({ xAuthUser, xAuthLocation });
      }
      
      if (loadingListId === uiStore.selectedShoppingList) {
        await listStillExists.loadListItems({ xAuthUser });
      }
    } catch (error) {
      console.error('Problem in ShoppingList loading Categories or Items:', error);
      // Only show alert if we're still on the same list
      if (listId === uiStore.selectedShoppingList) {
        Alert.alert('Network Error', 'Unable to load data. Please try refreshing.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderCategoryElement = ({ item: category, drag }: { item: CategoryType, drag: FnReturnVoid }) => (
    <CategoryFolder key={category.id} categoryId={category.id} title={category.name} drag={drag}>
      <ItemInput categoryId={category.id} />
      <CategoryItems listId={listId || ''} categoryId={category.id} />
    </CategoryFolder>
  );

  const onDragEnd = ({ data }: DragEndParams<CategoryType>) => {
    if (!currentList || !xAuthUser) return;
    
    data.forEach((category, index) => {
      if (category.ordinal !== index) {
        const updatedCategory = currentList.categories.find(c => c.id === category.id);
        const xAuthLocation = domainStore.nearestKnownLocationId ?? '';
        updatedCategory?.setOrdinal(index, xAuthUser, xAuthLocation);
      }
    });
  };

  useEffect(() => {
    // Don't load data until lists are fully loaded
    if (!uiStore.listsLoaded) return;

    // Small delay to ensure store is stable
    const timer = setTimeout(() => {
      // Get a fresh reference to the list
      const currentList = domainStore.lists.find((list) => list.id === listId);
      if (!currentList || !xAuthUser) return;
      
      loadData();
      // Only update navigation title if list still exists
      if (currentList && currentList.name) {
        navigation.setOptions({ title: currentList.name });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [listId, uiStore.listsLoaded, xAuthUser, domainStore.nearestKnownLocationId]);

  // Render null if no list is selected or user isn't authenticated
  if (!currentList || !xAuthUser) {
    return null;
  }

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
      {/* Only render content if we have a valid list */}
      {currentList && (
        <>
          <ItemInput listId={listId || ''} />
          <ListItems listId={listId || ''} />
          <NestableDraggableFlatList
            contentContainerStyle={styles.draggableFlatListStyle}
            data={toJS(currentList.categories).sort(sortByOrdinal)}
            renderItem={renderCategoryElement}
            keyExtractor={category => category.id}
            onDragEnd={onDragEnd}
          />
          <AddCategoryModal />
        </>
      )}
    </NestableScrollContainer>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default ShoppingList;