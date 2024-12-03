import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { ListsStackParamList } from '@/types/ListNavTypes';

import MyLists from './MyLists';
import ShoppingList from './ShoppingList';
import PurchaseHistory from './PurchaseHistory';

import AddListButton from '@/components/Buttons/AddListButton';
import AddCategoryButton from '@/components/Buttons/AddCategoryButton';
import { uiStore } from '@/stores/UIStore';
import stackNavScreenOptions from '@/consts/stackNavOptions';

const { Navigator, Screen } = createStackNavigator<ListsStackParamList>();

const ListsNavigation = () => {
  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  const onPressAddCategory = () => {
    uiStore.setAddCategoryModalVisible(true);
  };

  return (
    <Navigator initialRouteName="MyLists" screenOptions={stackNavScreenOptions}>
      <Screen name="MyLists" component={MyLists} options={{ title: 'My Lists', headerRight: () => <AddListButton dark={true} onPress={onPressAddList} /> }} />
      <Screen name="ShoppingList" component={ShoppingList} options={{ headerRight: () => <AddCategoryButton dark={true} onPress={onPressAddCategory} /> }} />
      <Screen name="PurchaseHistory" component={PurchaseHistory} />
    </Navigator>
  );
}

export default observer(ListsNavigation);