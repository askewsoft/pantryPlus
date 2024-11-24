import { Text } from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatList } from 'react-native';

import { styles } from './style';

// import AddListButton from '@/components/Buttons/AddListButton';
import { StackPropsMyLists } from '@/types/NavigationTypes';
import ListItem from '@/components/ListItem';

const MyLists = ({route, navigation}: StackPropsMyLists) => {
  return (
    <FlatList
      style={styles.container}
      data={['My List 1', 'My List 2', 'My List 3']}
      renderItem={({ item }) => <ListItem title={item} />}
    />
  );
}

export default observer(MyLists);