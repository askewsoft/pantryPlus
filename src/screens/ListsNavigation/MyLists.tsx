import { observer } from 'mobx-react-lite';
import { StyleSheet, View, Text, Button, RefreshControl } from 'react-native';
import { toJS } from 'mobx';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListElement from '@/components/ListElement';
import RemoveButton from '@/components/Buttons/RemoveButton';
import AddListModal from './modals/AddListModal';
import ShareListModal from './modals/ShareListModal';

import { domainStore, ListType } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';
import { sortByOrdinal } from '@/stores/utils/sorter';

const renderListElement = (navigation: any) => {
  return ({ item, drag }: { item: ListType, drag: () => void }) => {
    const userIsListOwner = item.ownerId === domainStore.user?.id;
    return (
      <ScaleDecorator activeScale={1.04}>
        <SwipeableItem
          key={item.id}
          item={item}
          overSwipe={20}
          snapPointsLeft={[70]}
          renderUnderlayLeft={() => (
            <RemoveButton onPress={onRemoveList(item.id)} />
          )}
          swipeEnabled={userIsListOwner}
        >
          <ListElement id={item.id} drag={drag} navigation={navigation}/>
        </SwipeableItem>
      </ScaleDecorator>
    );
  }
}

const onRemoveList = (listId: string) => {
  return () => {
    domainStore.removeList(listId);
  }
}

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  },
  noListsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noListsText: {
    fontSize: fonts.missingRowsTextSize,
    fontStyle: 'italic',
    color: colors.brandColor,
    marginBottom: 20,
  }
});

const MyLists = ({navigation}: StackPropsListsMyLists) => {
  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  const onRefresh = async () => {
    uiStore.setListsLoaded(false);
    await domainStore.loadLists();
    uiStore.setListsLoaded(true);
  }

  if (domainStore.lists.length <= 0 && !uiStore.addListModalVisible) {
    return (
      <View style={styles.noListsContainer}>
        <Text style={styles.noListsText}>No lists yet.</Text>
        <Button title="Click here to create a list" onPress={onPressAddList} color={colors.brandColor} />
      </View>
    );
  } else {
    return (
      /* IFF DraggableFlatList creates problems,
      * investigate https://github.com/fivecar/react-native-draglist
      */
      <View>
        <DraggableFlatList
          contentContainerStyle={styles.draggableFlatListStyle}
          data={toJS(domainStore.lists).sort(sortByOrdinal)}
          onDragEnd={domainStore.updateListOrder}
          renderItem={renderListElement(navigation)}
          keyExtractor={list => list.id}
          refreshControl={<RefreshControl refreshing={!uiStore.listsLoaded} onRefresh={onRefresh} />}
        />
        <AddListModal />
        <ShareListModal navigation={navigation} />
      </View>
    );
  }
}

export default observer(MyLists);