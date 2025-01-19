import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
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
  const { selectedShoppingList: listId } = uiStore;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;

  const renderCategoryElement = () => {
    return ({ item, drag }: { item: CategoryType, drag: () => void }) => {
      const category = currList!.categories.find(c => c.id === item.id);
      return (
        <CategoryFolder key={category!.id} categoryId={category!.id} title={category!.name} drag={drag}>
          <ItemInput category={category!} />
          <CategoryItems listId={currList!.id} categoryId={category!.id} />
        </CategoryFolder>
      );
    }
  }

  const onDragEnd = ({ data, from, to }: DragEndParams<CategoryType>) => {
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

  useEffect(() => {
    if (currList?.id === uiStore.selectedShoppingList) {
      navigation.setOptions({ title: currList?.name });
      currList?.loadCategories({ xAuthUser });
      currList?.loadListItems({ xAuthUser });
    }
  }, [currList?.id, xAuthUser, uiStore.selectedShoppingList]);

  return (
    <NestableScrollContainer style={styles.container}>
      <ItemInput list={currList!} />
      <ListItems listId={listId!} />
      <NestableDraggableFlatList
        contentContainerStyle={styles.draggableFlatListStyle}
        data={toJS(currList!.categories).sort(sortByOrdinal)}
        renderItem={renderCategoryElement()}
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