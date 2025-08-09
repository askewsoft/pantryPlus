import { observer } from 'mobx-react-lite';
import { StyleSheet, View, Text, Button, RefreshControl, FlatList } from 'react-native';
import { toJS } from 'mobx';

import BottomActionBar from '@/components/BottomActionBar';
import BottomActionButton from '@/components/Buttons/BottomActionButton';

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListElement from '@/components/ListElement';
import AddListModal from './modals/AddListModal';
import ShareListModal from './modals/ShareListModal';
import ReorderListsModal from './modals/ReorderListsModal';
import ErrorBoundary from '@/components/ErrorBoundary';

import { domainStore, ListType } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';
import { sortByOrdinal } from '@/stores/utils/sorter';

const renderListElement = (navigation: any) => {
  return ({ item }: { item: ListType }) => {
    return (
      <ListElement id={item.id} navigation={navigation}/>
    );
  }
}

const MyLists = ({navigation}: StackPropsListsMyLists) => {
  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  const onPressReorderLists = () => {
    uiStore.setReorderListsModalVisible(true);
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
          <FlatList
            style={styles.flatListStyle}
            contentContainerStyle={styles.listContentContainer}
            data={toJS(domainStore.lists).sort(sortByOrdinal)}
            renderItem={renderListElement(navigation)}
            keyExtractor={list => list.id}
            refreshControl={<RefreshControl refreshing={!uiStore.listsLoaded} onRefresh={onRefresh} />}
          />
          <BottomActionBar>
            <BottomActionButton
              label="Reorder"
              iconName="reorder"
              onPress={onPressReorderLists}
            />
            <BottomActionButton
              label="Add List"
              iconName="add-circle"
              onPress={onPressAddList}
            />
          </BottomActionBar>
        </View>
        <AddListModal />
        <ShareListModal navigation={navigation} />
        <ReorderListsModal />
      </ErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListStyle: {
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