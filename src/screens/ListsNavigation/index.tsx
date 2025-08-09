import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import MyLists from './MyLists';
import ShoppingList from './ShoppingList';

import HamburgerButton from '@/components/Buttons/HamburgerButton';
import ShoppingListContextMenu from '@/components/ContextMenus/ShoppingListContextMenu';
import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';

import { ListsStack, ListsStackParamList } from '@/types/ListNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

const { Navigator, Screen } = createStackNavigator<ListsStackParamList>();

const ListsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Lists' && ListsStack.includes(uiStore.lastViewedSubSection as typeof ListsStack[number])) {
      navigation.navigate('Lists', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: any) => {
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

  const onOpenDrawer = () => {
    navigation.openDrawer();
  };

  const ListHeaderRight = () => {
    return (
      <ShoppingListContextMenu
        onToggleEmptyFolders={() => {
          uiStore.setShowEmptyFolders(!uiStore.showEmptyFolders);
        }}
        onToggleAllFolders={() => {
          const currentList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
          if (!currentList) return;

          const newState = !uiStore.allFoldersOpen;
          uiStore.setAllFoldersOpen(newState);

          // Set visible categories to the new state
          // If empty folders are hidden, only affect categories with items
          currentList.categories.forEach(category => {
            if (uiStore.showEmptyFolders || category.items.length > 0) {
              uiStore.setOpenCategory(category.id, newState);
            }
          });
        }}
        onReorderCategories={() => {
          const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
          if (xAuthLocation === '') {
            Alert.alert('Location Required', 'Please select a location to reorder categories.');
            return;
          }
          uiStore.setReorderCategoriesModalVisible(true);
        }}
        onToggleCategoryLabels={() => {
          uiStore.setShowCategoryLabels(!uiStore.showCategoryLabels);
        }}
      />
    );
  }

  const myListsOptions = {
    title: 'My Lists',
    headerMode: 'float' as const,
    headerLeft: () => <HamburgerButton onPress={onOpenDrawer} />
  }

  const shoppingListOptions = {
    headerRight: () => <ListHeaderRight />,
    headerTitleStyle: {
      fontWeight: 'bold' as const,
      textAlign: 'right' as const,
    }
  }

  return (
    <Navigator initialRouteName="MyLists" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
      <Screen name="MyLists" component={MyLists} options={myListsOptions} />
      <Screen name="ShoppingList" component={ShoppingList} options={shoppingListOptions} />
    </Navigator>
  );
}

export default observer(ListsNavigation);