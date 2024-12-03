import { StyleSheet, View, Text, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';
import CheckBoxButton from './Buttons/CheckBoxButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';

const ProductItems = ({ listId, categoryId }: { listId: string, categoryId: string }) => {
  return <FlatList style={styles.container}
    data={[{ name: 'Light Wheat Bread' }, { name: 'Orange Juice' }]}
    keyExtractor={(item) => item.name}
    renderItem={({ item }) => (
      <View style={styles.itemLine}>
        <View style={styles.itemContainer}>
          <CheckBoxButton />
          <Text style={styles.item}>{item.name}</Text>
        </View>
        <MaterialIcons.Button name="drag-handle" size={24} backgroundColor="white" color="purple" iconStyle={{ padding: 0, margin: 0 }} />
      </View>
    )}
  />;
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  itemLine: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 20,
  },
  item: {
    color: 'purple',
    fontSize: 18,
  }
});

export default observer(ProductItems);