import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';
import { ListsStackParamList } from '@/types/NavigationTypes';
import MyLists from './MyLists';
import ShoppingList from './ShoppingList';
import PurchaseHistory from './PurchaseHistory';

const { Navigator, Screen } = createStackNavigator<ListsStackParamList>();

const ListsNavigation = () => {
  return (
    <Navigator initialRouteName="MyLists">
      <Screen name="MyLists" component={MyLists} options={{ headerShown: false }} />
      <Screen name="ShoppingList" component={ShoppingList} options={{ headerShown: true }} />
      <Screen name="PurchaseHistory" component={PurchaseHistory} options={{ headerShown: true }} />
    </Navigator>
  );
}

export default observer(ListsNavigation);