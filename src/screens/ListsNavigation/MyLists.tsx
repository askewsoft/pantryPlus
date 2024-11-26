import { observer } from 'mobx-react-lite';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { StyleSheet } from 'react-native';

// import AddListButton from '@/components/Buttons/AddListButton';
import { StackPropsMyLists } from '@/types/ListNavTypes';
import ListItem from '@/components/ListItem';

import { domainStore, ListType } from '@/models/DomainStore';
// TODO: remove dummy data backend integration
import { listsDummyData } from './listsDummyData';

import colors from '@/colors';

const MyLists = ({route, navigation}: StackPropsMyLists) => {
  return (
    /* IFF DraggableFlatList creates problems,
     * investigate https://github.com/fivecar/react-native-draglist
    */
    <DraggableFlatList
      contentContainerStyle={styles.draggableFlatListStyle}
      data={listsDummyData}
      renderItem={renderListItem}
      keyExtractor={keyExtractor}
    />
  );
}

const renderListItem = ({ item, drag }: { item: ListType, drag: () => void }) => {
  return (
    <ScaleDecorator activeScale={1.04}>
      <ListItem title={item.name} id={item.id} drag={drag} />
    </ScaleDecorator>
  );
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