import { Text, View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/colors';

const ListItem = ({title}: {title: string}) => {
  return <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <MaterialIcons.Button
      name="drag-handle"
      size={18}
      backgroundColor={colors.itemBackground}
      color={colors.brandColor}
      iconStyle={{ padding: 0, margin: 0 }}
    />
  </View>;
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandColor,
  }
});

export default observer(ListItem);