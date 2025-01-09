import { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import { domainStore, ShopperType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import Shopper from '@/components/Shopper';
import colors from '@/consts/colors';

const GroupMembers = ({ groupId }: { groupId: string }) => {
  const currGroup = domainStore.groups.find(g => g.id === groupId);
  const xAuthUser = domainStore.user?.email!;

  const onRemoveItem = (shopperId: string) => {
    return () => {
      // currGroup?.removeShopper({ shopperId, xAuthUser });
    }
  }

  useEffect(() => {
    // currGroup?.loadShoppers({ xAuthUser });
  }, [xAuthUser]);

  const renderShopper = ({ item }: { item: ShopperType }) => {
    return (
      <Shopper shopper={item} onRemoveItem={onRemoveItem(item.id)} indent={30}/>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.draggableFlatListStyle]}
      data={toJS(currGroup!.shoppers)}
      renderItem={renderShopper}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(GroupMembers);