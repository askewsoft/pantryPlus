import { StyleSheet, View } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import Item from './Item';
import { ItemType } from '@/stores/models/List';

import colors from '@/consts/colors';

type ItemsListProps = {
  items: ItemType[];
  listId: string;
  categoryId?: string;
  indent?: number;
};

const ItemsList = observer(({ 
  items, 
  listId,
  categoryId,
  indent = 10,
}: ItemsListProps) => {
  return (
    <View style={styles.draggableFlatListStyle}>
      {toJS(items).map((item: ItemType) => (
        <Item
          key={item.id}
          item={item}
          listId={listId}
          categoryId={categoryId}
          indent={indent}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
    paddingTop: 5,
  }
});

export default ItemsList; 