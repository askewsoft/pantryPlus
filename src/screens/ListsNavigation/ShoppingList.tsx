import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsShoppingList } from '@/types/NavigationTypes';
import CategoryFolder from '@/components/CategoryFolder';
import ProductItems from '@/components/ProductItems';
import { styles } from './style';

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

export default observer(ShoppingList);