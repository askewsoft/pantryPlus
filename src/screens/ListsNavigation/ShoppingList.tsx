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
  const xAuthUser = domainStore.user?.email;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get current list as a computed value and ensure it exists
  const currentList = domainStore.lists.find((list) => list.id === listId);

  const loadData = async () => {
    if (!currentList || !xAuthUser) return;
    
    setIsRefreshing(true);
    try {
      // Load data sequentially to avoid race conditions
      await currentList.loadCategories({ xAuthUser });
      await currentList.loadListItems({ xAuthUser });
    } catch (error) {
      console.error('Problem in ShoppingList loading Categories or Items:', error);
      Alert.alert('Network Error', 'Unable to load data. Please try refreshing.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderCategoryElement = ({ item, drag }: { item: CategoryType, drag: () => void }) => (
    <CategoryFolder key={item.id} categoryId={item.id} title={item.name} drag={drag}>
      <ItemInput categoryId={item.id} />
      <CategoryItems listId={listId || ''} categoryId={item.id} />
    </CategoryFolder>
  );

  const onDragEnd = ({ data }: DragEndParams<CategoryType>) => {
    if (!currentList || !xAuthUser) return;
    
    data.forEach((category, index) => {
      if (category.ordinal !== index) {
        const updatedCategory = currentList.categories.find(c => c.id === category.id);
        updatedCategory?.setOrdinal(index, xAuthUser);
      }
    });
  };

  useEffect(() => {
    if (!currentList || !xAuthUser || !uiStore.listsLoaded) return;

    loadData();
    navigation.setOptions({ title: currentList.name });
  }, [listId, uiStore.listsLoaded, xAuthUser]);

  if (!currentList || !xAuthUser) {
    return null;
  }

  return (
    <NestableScrollContainer 
      style={styles.container} 
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={loadData} />
      }
    >
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
    </NestableScrollContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(ShoppingList);