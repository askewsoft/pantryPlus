import { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Item from './Item';

const ListItems = ({ listId }: { listId: string }) => {
  const open = uiStore.selectedShoppingList === listId;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const xAuthUser = domainStore.user?.email!;

  useEffect(() => {
    currList?.loadListItems ({ xAuthUser });
  }, [xAuthUser]);

  return <FlatList style={[styles.container, { display: open ? 'flex' : 'none' }]}
    data={currList?.items}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <Item item={item} />
    )}
  />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  }
});

export default observer(ListItems);