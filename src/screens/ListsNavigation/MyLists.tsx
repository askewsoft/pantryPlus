import { observer } from 'mobx-react-lite';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { StyleSheet, View, Text, Button } from 'react-native';
import { toJS } from 'mobx';

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListElement from '@/components/ListElement';
import AddListModal from './modals/AddListModal';
import ShareListModal from './modals/ShareListModal';

import { domainStore, ListType } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';
import { sortByOrdinal } from '@/stores/utils/sorter';

const renderListElement = (navigation: any) => {
  return ({ item, drag }: { item: ListType, drag: () => void }) => {
    return (
      <ScaleDecorator activeScale={1.04}>
        <ListElement id={item.id} drag={drag} navigation={navigation}/>
      </ScaleDecorator>
    );
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
        />
        <AddListModal />
        <ShareListModal />
      </View>
    );
  }
}

export default observer(MyLists);