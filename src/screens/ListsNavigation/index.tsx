import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { ListsStackParamList } from '@/types/ListNavTypes';

import MyLists from './MyLists';
import ShoppingList from './ShoppingList';
import PurchaseHistory from './PurchaseHistory';

import AddListButton from '@/components/Buttons/AddListButton';
import colors from '@/colors';
import { uiStore } from '@/models/UIStore';

const { Navigator, Screen } = createStackNavigator<ListsStackParamList>();

const ListsNavigation = () => {
  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  return (
    <Navigator
      initialRouteName="MyLists"
      screenOptions={{
        headerStyle: {
          height: 40,
          backgroundColor: colors.brandColor,
        },
        headerTitleAlign: 'left',
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShown: true
      }}
    >
      <Screen name="MyLists" component={MyLists} options={{ title: 'My Lists', headerRight: () => <AddListButton dark={true} onPress={onPressAddList} /> }} />
      <Screen name="ShoppingList" component={ShoppingList} />
      <Screen name="PurchaseHistory" component={PurchaseHistory} />
    </Navigator>
  );
}

export default observer(ListsNavigation);