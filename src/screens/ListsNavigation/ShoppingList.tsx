import { useEffect, useState, useRef } from 'react';
import { StyleSheet, RefreshControl, Alert, View } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragEndParams } from 'react-native-draggable-flatlist';
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist";

import { FnReturnVoid } from '@/types/FunctionArgumentTypes';
import CategoryFolder from '@/components/CategoryFolder';
import CategoryItems from '@/components/CategoryItems';
import ListItems from '@/components/ListItems';
import AddCategoryModal from './modals/AddCategoryModal';
import AddItemModal from './modals/AddItemModal';
import PickLocationPrompt from './modals/PickLocationPrompt';
import ReorderCategoriesModal from './modals/ReorderCategoriesModal';
import CurrentLocation from '@/components/CurrentLocation';
import ErrorBoundary from '@/components/ErrorBoundary';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import { CategoryType } from '@/stores/models/List';
import colors from '@/consts/colors';
import { sortByOrdinal } from '@/stores/utils/sorter';

const ShoppingList = observer(({ navigation }: { navigation: any }) => {
  const listId = uiStore.selectedShoppingList;
  const xAuthUser = domainStore.user?.email;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollViewRef = useRef<any>(null);
  
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
        const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
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

  const renderCategoryElement = ({ item: category, drag }: { item: CategoryType, drag: FnReturnVoid }) => {
    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    
    // Only allow drag if location is set
    const conditionalDrag = () => {
      if (xAuthLocation === '') {
        uiStore.setPickLocationPromptVisible(true);
        return;
      }
      drag();
    };

    return (
      <CategoryFolder 
        key={category.id} 
        categoryId={category.id} 
        title={category.name} 
      >
        <CategoryItems listId={listId!} categoryId={category.id} />
      </CategoryFolder>
    );
  };

  const onDragBegin = () => {
    // This will only be called if drag is allowed (location is set)
    // No need to check location here since we prevent drag from starting
  }

  const onDragEnd = ({ data }: DragEndParams<CategoryType>) => {
    if (!currentList || !xAuthUser) return;

    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    if (xAuthLocation === '') {
      // Prompt the user to select a location, if there is no nearest known location already set
      uiStore.setPickLocationPromptVisible(true);
      return;
    }

    // Update the ordinals in sequence to avoid race conditions
    const updateOrdinals = async () => {
      try {
        for (let i = 0; i < data.length; i++) {
          const category = data[i];
          if (category.ordinal !== i) {
            const updatedCategory = currentList.categories.find(c => c.id === category.id);
            if (updatedCategory) {
              await updatedCategory.setOrdinal(i, xAuthUser, xAuthLocation);
            }
          }
        }
      } catch (error) {
        console.error('Error updating category order:', error);
        Alert.alert('Error', 'Failed to update category order. Please try again.');
      }
    };

    updateOrdinals();
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
  }, [listId, uiStore.listsLoaded, xAuthUser, domainStore.selectedKnownLocationId]);

  // Render null if no list is selected or user isn't authenticated
  if (!currentList || !xAuthUser) {
    return null;
  }

  const setCurrentLocation = () => {
    uiStore.setPickLocationPromptVisible(false);
    domainStore.setLocationEnabled(true);
    navigation.navigate('Locations', { screen: 'MyLocations', params: { returnToList: true } });
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <CurrentLocation onPress={setCurrentLocation} />
        <NestableScrollContainer 
          ref={scrollViewRef}
          style={styles.scrollContainer} 
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadData} />}
        >
          {/* Only render content if we have a valid list */}
          {currentList && (
            <View style={styles.contentContainer}>
              <ListItems listId={listId!} />
              <NestableDraggableFlatList
                style={styles.draggableFlatListStyle}
                data={toJS(currentList.categories)
                  .filter(category => uiStore.showEmptyFolders || category.items.length > 0)
                  .sort(sortByOrdinal)}
                renderItem={renderCategoryElement}
                keyExtractor={category => category.id}
                onDragBegin={onDragBegin}
                onDragEnd={onDragEnd}
              />
              <AddCategoryModal />
              <AddItemModal />
              <PickLocationPrompt onPress={setCurrentLocation} />
              <ReorderCategoriesModal />
            </View>
          )}
        </NestableScrollContainer>
      </View>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  scrollContainer: {
    flexDirection: 'column',
  },
  contentContainer: {
    marginBottom: 18, // unsure why w/o this the tabNavBar covers the bottom of the list
  },
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default ShoppingList;