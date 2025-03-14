import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';
import { EventArg, StackNavigationState } from '@react-navigation/native';

import MyLists from './MyLists';
import ShoppingList from './ShoppingList';

import AddButton from '@/components/Buttons/AddButton';
import { uiStore } from '@/stores/UIStore';

import { ListsStack, ListsStackParamList } from '@/types/ListNavTypes';
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

const ListsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Lists' && ListsStack.includes(uiStore.lastViewedSubSection as typeof ListsStack[number])) {
      navigation.navigate('Lists', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: EventArg<"state", false, { state: StackNavigationState<ListsStackParamList> }>) => {
    const routesLength = e.data.state.routes.length;
    const currentRoute = e.data.state.routes[routesLength - 1].name;

    // If we're on MyLists and we had a previous route, this was an explicit navigation
    if (currentRoute === "MyLists" && prevRoute.current !== null) {
      uiStore.setLastViewedSubSection('');
    } else if (currentRoute !== "MyLists") {
      uiStore.setLastViewedSubSection(currentRoute as typeof ListsStack[number]);
    }

    prevRoute.current = currentRoute;
  }

  const onPressAddList = () => {
    uiStore.setAddListModalVisible(true);
  };

  const onPressAddCategory = () => {
    uiStore.setAddCategoryModalVisible(true);
  };

  const onPressAddProduct = () => {
    const listId = uiStore.selectedShoppingList || '';
    uiStore.setAddItemToCategoryID('');
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
  
  const myListsOptions = {
    title: 'My Lists',
    headerMode: 'float' as const,
    headerRight: () => {
      return (
        <AddButton
          foreground={colors.white}
          background={colors.brandColor}
          materialIconName="add-circle"
          onPress={onPressAddList}
        />
      );
    }
  }

  const shoppingListOptions = {
    headerRight: () => <ListHeaderRight />
  }

  return (
    <Navigator initialRouteName="MyLists" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
      <Screen name="MyLists" component={MyLists} options={myListsOptions} />
      <Screen name="ShoppingList" component={ShoppingList} options={shoppingListOptions} />
    </Navigator>
  );
}

export default observer(ListsNavigation);