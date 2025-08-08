import { observer } from 'mobx-react-lite';
import { StyleSheet, View, Text, Button, RefreshControl } from 'react-native';
import { toJS } from 'mobx';
import DraggableFlatList from 'react-native-draggable-flatlist';

import BottomActionBar from '@/components/BottomActionBar';
import BottomActionButton from '@/components/Buttons/BottomActionButton';

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListElement from '@/components/ListElement';
import AddListModal from './modals/AddListModal';
import ShareListModal from './modals/ShareListModal';
import ErrorBoundary from '@/components/ErrorBoundary';

import { domainStore, ListType } from '@/stores/DomainStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';
import { sortByOrdinal } from '@/stores/utils/sorter';

const renderListElement = (navigation: any) => {
  return ({ item, drag }: { item: ListType, drag: FnReturnVoid }) => {
    return (
      <ListElement id={item.id} drag={drag} navigation={navigation}/>
    );
  }
}

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
      <ErrorBoundary>
        <View style={styles.container}>
          <View style={styles.noListsContainer}>
            <Text style={styles.noListsText}>No lists yet.</Text>
            <Button title="Click here to create a list" onPress={onPressAddList} color={colors.brandColor} />
          </View>
          <BottomActionBar>
            <BottomActionButton
              label="Add List"
              iconName="add-circle"
              onPress={onPressAddList}
            />
          </BottomActionBar>
        </View>
      </ErrorBoundary>
    );
  } else {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <DraggableFlatList
            style={styles.draggableFlatListStyle}
            contentContainerStyle={styles.listContentContainer}
            data={toJS(domainStore.lists).sort(sortByOrdinal)}
            onDragEnd={domainStore.updateListOrder}
            renderItem={renderListElement(navigation)}
            keyExtractor={list => list.id}
            refreshControl={<RefreshControl refreshing={!uiStore.listsLoaded} onRefresh={onRefresh} />}
          />
          <BottomActionBar>
            <BottomActionButton
              label="Add List"
              iconName="add-circle"
              onPress={onPressAddList}
            />
          </BottomActionBar>
        </View>
        <AddListModal />
        <ShareListModal navigation={navigation} />
      </ErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  draggableFlatListStyle: {
    height: '93.5%',
  },
  listContentContainer: {
    paddingBottom: 0,
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

export default observer(MyLists);