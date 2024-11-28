import { Text, View, StyleSheet, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore, ListType } from '@/models/DomainStore';

import colors from '@/colors';

const ListItem = ({id, drag, navigation}: {id: string, drag: () => void, navigation: any}) => {
  // const list = domainStore.lists.find(list => list.id === id);

  const handlePress = ({ id }: { id: string }) => {
    navigation.navigate('ShoppingList', { id });
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.titleContainer} onPress={() => handlePress({ id })}>
        <MaterialIcons name="format-list-bulleted" size={18} color={colors.brandColor} />
        <Text style={styles.title}>{id}</Text>
      </Pressable>
      <MaterialIcons.Button
        name="drag-handle"
        size={18}
        backgroundColor={colors.itemBackground}
        color={colors.brandColor}
        iconStyle={{ padding: 0, margin: 0 }}
        onLongPress={drag}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '80%',
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandColor,
    marginLeft: 5,
  }
});

export default observer(ListItem);