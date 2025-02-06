import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { ListsStackParamList } from '@/types/ListNavTypes';

import MyLists from './MyLists';
import ShoppingList from './ShoppingList';
import PurchaseHistory from './PurchaseHistory';

import AddButton from '@/components/Buttons/AddButton';
import { uiStore } from '@/stores/UIStore';
import stackNavScreenOptions from '@/consts/stackNavOptions';
import colors from '@/consts/colors';

const { Navigator, Screen } = createStackNavigator<ListsStackParamList>();


/* TODO: Find a way to hide the ItemInput element when the user presses the back button
   * take a look at https://reactnavigation.org/docs/stack-navigator/#transitionstart
const onBackPress = () => {
  uiStore.setAddItemToCategoryID('');
  uiStore.setAddItemToListID('');
}
*/

const ListsNavigation = () => {
  const listId = uiStore.selectedShoppingList || '';

  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  const onPressAddCategory = () => {
    uiStore.setAddCategoryModalVisible(true);
  };

  const onPressAddProduct = () => {
    // uiStore.setSelectedShoppingList(listId);
    uiStore.addItemToListID !== listId ? uiStore.setAddItemToListID(listId) : uiStore.setAddItemToListID('');
  }

  const ListHeaderRight = () => {
    return (
      <>
        <AddButton
          foreground={colors.white}
          background={colors.brandColor}
          materialIconName="add-task"
          onPress={onPressAddProduct}
        />
        <AddButton
          foreground={colors.white}
          background={colors.brandColor}
          materialIconName="create-new-folder"
          onPress={onPressAddCategory}
        />
      </>
    );
  }

  return (
    <Navigator initialRouteName="MyLists" screenOptions={stackNavScreenOptions}>
      <Screen name="MyLists"
        component={MyLists}
        options={{
          title: 'My Lists',
          headerMode: 'float', // ensures consistent header behavior on Android
          headerRight: () =>
            <AddButton
              foreground={colors.white}
              background={colors.brandColor}
              materialIconName="add-circle"
              onPress={onPressAddList}
            />
        }}
      />
      <Screen name="ShoppingList"
        component={ShoppingList}
        options={{
          headerRight: () =>
            <ListHeaderRight />
        }}
      />
      <Screen name="PurchaseHistory" component={PurchaseHistory} />
    </Navigator>
  );
}

export default observer(ListsNavigation);