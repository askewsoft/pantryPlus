import { StyleSheet, View, Text, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';
import CheckBoxButton from './Buttons/CheckBoxButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const ProductItems = ({ categoryId }: { categoryId: string }) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  return <FlatList style={styles.container}
    data={[{ name: 'Light Wheat Bread' }, { name: 'Orange Juice' }]}
    keyExtractor={(item) => item.name}
    renderItem={({ item }) => (
      <View style={[styles.itemLine, { display: open ? 'flex' : 'none' }]}>
        <View style={styles.itemContainer}>
          <CheckBoxButton />
          <Text style={styles.item}>{item.name}</Text>
        </View>
        <MaterialIcons.Button
          name="drag-indicator"
          size={fonts.listItemIconSize}
          backgroundColor={colors.itemBackground}
          color={colors.brandColor}
          iconStyle={{ padding: 0, margin: 0 }}
          style={{ alignSelf: 'flex-end' }}
        />
      </View>
    )}
  />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
    marginTop: 2,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 30,
  },
  item: {
    color: colors.brandColor,
    fontSize: fonts.listItemTextSize,
  }
});

export default observer(ProductItems);