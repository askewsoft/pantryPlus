import { Text, View, StyleSheet, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore, ListType } from '@/models/DomainStore';

import colors from '@/colors';

const ListItem = ({title, id, drag}: {title: string, id: string, drag: () => void}) => {
  // const list = domainStore.lists.find(list => list.id === id);
  return (
    // TODO: replace w/ SwipeableItem
    <View style={styles.container}>
      <Pressable style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
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
    width: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandColor,
  }
});

export default observer(ListItem);