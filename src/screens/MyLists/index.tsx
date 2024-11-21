import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

import { styles } from './style';
import Heading from '@/components/Heading';
import AddListButton from '@/components/Buttons/AddListButton';
import MenuBar from '@/components/MenuBar';
import ProductItems from '@/components/ProductItems';
import CategoryFolder from '@/components/CategoryFolder';

const MyListsScreen = () => {
  return (
    <View style={styles.container}>
      <Heading heading="My Lists">
        <AddListButton />
      </Heading>
      <View style={styles.listsContainer}>
        <CategoryFolder title="Produce" open={true}>
          <ProductItems />
        </CategoryFolder>
      </View>
      <MenuBar />
    </View>
  );
}

export default observer(MyListsScreen);
