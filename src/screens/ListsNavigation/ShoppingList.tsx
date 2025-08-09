import { useEffect, useState, useRef } from 'react';
import { StyleSheet, RefreshControl, Alert, View, FlatList, ScrollView } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import CategoryFolder from '@/components/CategoryFolder';
import CategoryItems from '@/components/CategoryItems';
import ListItems from '@/components/ListItems';
import AddCategoryModal from './modals/AddCategoryModal';
import AddItemModal from './modals/AddItemModal';
import PickLocationPrompt from './modals/PickLocationPrompt';
import ReorderCategoriesModal from './modals/ReorderCategoriesModal';
import CurrentLocation from '@/components/CurrentLocation';
import ErrorBoundary from '@/components/ErrorBoundary';
import BottomActionBar from '@/components/BottomActionBar';
import BottomActionButton from '@/components/Buttons/BottomActionButton';

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

  const renderCategoryElement = ({ item: category }: { item: CategoryType }) => {
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

  const onPressAddCategory = () => {
    uiStore.setAddCategoryModalVisible(true);
  };

  const onPressAddItem = () => {
    uiStore.setAddItemModalVisible(true);
  };

  return (
    <ErrorBoundary>
            <View style={styles.container}>
        <CurrentLocation onPress={setCurrentLocation} />
        {/* Only render content if we have a valid list */}
        {currentList && (
          <FlatList
            ref={scrollViewRef}
            style={styles.flatListStyle}
            data={toJS(currentList.categories)
              .filter(category => uiStore.showEmptyFolders || category.items.length > 0)
              .sort(sortByOrdinal)}
            renderItem={renderCategoryElement}
            keyExtractor={category => category.id}
            ListHeaderComponent={<ListItems listId={listId!} />}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadData} />}
          />
        )}
        <BottomActionBar>
          <BottomActionButton
            label="Add Item"
            iconName="add-circle"
            onPress={onPressAddItem}
          />
          <BottomActionButton
            label="Add Category"
            iconName="create-new-folder"
            onPress={onPressAddCategory}
          />
        </BottomActionBar>
      </View>
      <AddCategoryModal />
      <AddItemModal />
      <PickLocationPrompt onPress={setCurrentLocation} />
      <ReorderCategoriesModal />
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  flatListStyle: {
    flex: 1,
    backgroundColor: colors.detailsBackground,
  }
});

export default ShoppingList;