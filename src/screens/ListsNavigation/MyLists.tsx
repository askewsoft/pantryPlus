import { observer } from 'mobx-react-lite';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { StyleSheet, View } from 'react-native';
import { toJS } from 'mobx';

import { StackPropsListsMyLists } from '@/types/ListNavTypes';
import ListItem from '@/components/ListItem';
import AddListModal from '@/modals/AddListModal';

import { domainStore, ListType } from '@/models/DomainStore';

import colors from '@/colors';

const MyLists = ({route, navigation}: StackPropsListsMyLists) => {
  return (
    <View>
      <DraggableFlatList
        contentContainerStyle={styles.draggableFlatListStyle}
        data={toJS(domainStore.lists)}
        renderItem={renderListItem(navigation)}
        keyExtractor={keyExtractor}
      />
      <AddListModal />
    </View>
  );
}

const renderListItem = (navigation: any) => {
  return ({ item, drag }: { item: ListType, drag: () => void }) => {
    console.log(`item: ${JSON.stringify(item)}`);
    return (
      <ScaleDecorator activeScale={1.04}>
        <ListItem id={item.id} drag={drag} navigation={navigation}/>
      </ScaleDecorator>
    );
  }
}

const keyExtractor = (item: ListType) => item.id;

// TODO: update the list order in the model & db
const onDragEnd = (data: ListType[], from: number, to: number) => {
  domainStore.lists.splice(from, 1);
  domainStore.lists.splice(to, 0, data[from]);
}

const styles = StyleSheet.create({
  draggableFlatListStyle: {
    backgroundColor: colors.detailsBackground,
  }
});

export default observer(MyLists);