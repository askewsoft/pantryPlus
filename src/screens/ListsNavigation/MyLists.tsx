import { observer } from 'mobx-react-lite';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { StyleSheet, View, Text, Button } from 'react-native';
import { toJS } from 'mobx';

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListItem from '@/components/ListItem';
import AddListModal from '@/modals/AddListModal';

import { domainStore, ListType } from '@/models/DomainStore';

import colors from '@/colors';
import { uiStore } from '@/models/UIStore';

const keyExtractor = (item: ListType) => item.id;

// TODO: update the list order in the model & db
const onDragEnd = (data: ListType[], from: number, to: number) => {
  domainStore.lists.splice(from, 1);
  domainStore.lists.splice(to, 0, data[from]);
}

const renderListItem = (navigation: any) => {
  return ({ item, drag }: { item: ListType, drag: () => void }) => {
    return (
      <ScaleDecorator activeScale={1.04}>
        <ListItem id={item.id} drag={drag} navigation={navigation}/>
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
    fontSize: 24,
    fontStyle: 'italic',
    color: colors.brandColor,
    marginBottom: 20,
  }
});


const MyLists = ({route, navigation}: StackPropsListsMyLists) => {
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
          data={toJS(domainStore.lists)}
          // onDragEnd={onDragEnd}
          renderItem={renderListItem(navigation)}
          keyExtractor={keyExtractor}
        />
        <AddListModal />
      </View>
    );
  }
}

export default observer(MyLists);