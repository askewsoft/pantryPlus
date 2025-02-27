import { StyleSheet } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist';

import { domainStore } from '@/stores/DomainStore';
import Item from './Item';
import { ItemType } from '@/stores/models/List';
import { sortByOrdinal } from '@/stores/utils/sorter';

import colors from '@/consts/colors';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';
import appConfig from '@/config/app';

const { debug } = appConfig;

const ListItems = ({ listId }: { listId: string }) => {
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;

  const onRemoveItem = (itemId: string) => {
    return () => {
      currList?.removeItem({ itemId, xAuthUser });
    }
  }

  const onPurchaseListItem = (itemId: string) => {
    return async () => {
      const xAuthLocation = domainStore.nearestKnownLocationId ?? '';
      // TODO: how do we handle the case where there is no known nearest location?
      if (debug) console.log('purchaseListItem', JSON.stringify({ itemId, xAuthLocation, listName: currList?.name }));
      if (currList) {
        if (debug) console.log('purchasingListItem', itemId);
        await currList.purchaseItem({ itemId, xAuthUser, xAuthLocation });
        if (debug) console.log('removingListItem', itemId);
        currList.removeItem({ itemId, xAuthUser });
        if (debug) console.log('purchasedListItem', itemId);
      }
    }
  }

  const renderItem = ({ item, drag }: { item: ItemType, drag: FnReturnVoid }) => {
    const currItem = currList?.items.find(i => i.id === item.id);
    return (
        <Item
          item={currItem!}
          onRemoveItem={onRemoveItem(item.id)}
          onPurchaseItem={onPurchaseListItem(item.id)}
          drag={drag}
          indent={10}
        />
    );
  }

  return <NestableDraggableFlatList
    contentContainerStyle={styles.draggableFlatListStyle}
    data={toJS(currList?.items || []).sort(sortByOrdinal)}
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    onDragEnd={currList?.updateItemOrder}
  />;
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  },
});

export default observer(ListItems);