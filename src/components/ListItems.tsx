import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { domainStore } from '@/stores/DomainStore';
import Item from './Item';
import { ItemType } from '@/stores/models/List';
import { sortByOrdinal } from '@/stores/utils/sorter';
import colors from '@/consts/colors';

const ListItems = ({ listId }: { listId: string }) => {
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;

  const renderItem = ({ item, drag }: { item: ItemType, drag: () => void }) => {
    const currItem = currList?.items.find(i => i.id === item.id);
    return (
      <ScaleDecorator activeScale={1.04}>
        <Item item={currItem!} drag={drag}/>
      </ScaleDecorator>
    );
  }

  useEffect(() => {
    currList?.loadListItems ({ xAuthUser });
  }, [xAuthUser]);

  return <DraggableFlatList
    contentContainerStyle={styles.draggableFlatListStyle}
    data={toJS(currList!.items).sort(sortByOrdinal)}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    onDragEnd={currList!.updateItemOrder}
  />;
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(ListItems);