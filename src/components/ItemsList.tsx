import { StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist';

import Item from './Item';
import { ItemType } from '@/stores/models/List';
import { sortByOrdinal } from '@/stores/utils/sorter';

import colors from '@/consts/colors';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

type ItemsListProps = {
  items: ItemType[];
  listId: string;
  categoryId?: string;
  onDragEnd?: (params: any) => void;
  indent?: number;
};

const ItemsList = observer(({ 
  items, 
  listId,
  categoryId,
  onDragEnd,
  indent = 10,
}: ItemsListProps) => {
  const renderItem = ({ item, drag }: { item: ItemType, drag: FnReturnVoid }) => {
    return (
      <Item
        item={item}
        listId={listId}
        categoryId={categoryId}
        drag={drag}
        indent={indent}
      />
    );
  }

  return (
    <NestableDraggableFlatList
      contentContainerStyle={styles.draggableFlatListStyle}
      data={toJS(items).sort(sortByOrdinal)}
      onDragEnd={onDragEnd}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      dragItemOverflow={true}
    />
  );
});

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default ItemsList; 