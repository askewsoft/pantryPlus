import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsShoppingList } from '@/types/ListNavTypes';
import CategoryFolder from '@/components/CategoryFolder';
import ProductItems from '@/components/ProductItems';

const ShoppingList = ({route, navigation}: StackPropsShoppingList) => {
  return (
    <View style={styles.container}>
      <View style={styles.listsContainer}>
        <CategoryFolder title="Produce" open={true}>
          <ProductItems />
        </CategoryFolder>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    justifyContent: 'center'
  },
  listsContainer: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default observer(ShoppingList);