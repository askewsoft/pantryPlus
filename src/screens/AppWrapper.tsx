import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { observer } from 'mobx-react';
import { EventArg, NavigationContainer, TabNavigationState } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppTabs,AppTabsParamList } from '@/types/AppNavTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';

import { uiStore } from '@/stores/UIStore';

import colors from '@/consts/colors';
import tabOptions from '@/consts/tabNavOptions';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const { Navigator, Screen } = createBottomTabNavigator<AppTabsParamList>();

const AppWrapper = () => {
  const screenOptions: BottomTabNavigationOptions = { headerShown: false, lazy: false };

  const tabBarIconCreator = (name: MaterialIconName) => {
      return function ({ color, size }: { color: string, size: number }) {
          return <MaterialIcons name={name} color={color} size={size} />;
      }
  };

  const getInitialAppTabsRouteName = (): typeof AppTabs[number] => {
    // One of those times where TypeScript is just not smart enough to infer the type
    return AppTabs.includes(uiStore.lastViewedSection as typeof AppTabs[number]) ? uiStore.lastViewedSection as typeof AppTabs[number] : 'Lists';
  }

  const onScreenChange = (e: EventArg<"state", false, { state: TabNavigationState<AppTabsParamList> }>) => {
    const lastTab = e.data.state.history[e.data.state.history.length - 1];
    const routeName = lastTab.key.split('-')[0] as typeof AppTabs[number];
    if (routeName && AppTabs.includes(routeName)) {
      uiStore.setLastViewedSection(routeName);
      console.log('lastViewedSection', routeName);
    }
  }

  return (
    // View is needed to push the status bar to the bottom of the screen
    // This should not be needed.
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Navigator initialRouteName={getInitialAppTabsRouteName()} screenOptions={screenOptions} screenListeners={{ state: onScreenChange }}>
          <Screen name="Lists" component={ListsNavigation} options={{...tabOptions({iconName: 'list-alt'}), tabBarIcon: tabBarIconCreator('list-alt')}} />
          <Screen name="Groups" component={GroupsNavigation} options={{...tabOptions({iconName: 'groups'}), tabBarIcon: tabBarIconCreator('groups')}} />
          <Screen name="Locations" component={LocationsNavigation} options={{...tabOptions({iconName: 'store'}), tabBarIcon: tabBarIconCreator('store')}} />
          <Screen name="Settings" component={SettingsNavigation} options={{...tabOptions({iconName: 'settings'}), tabBarIcon: tabBarIconCreator('settings')}} />
        </Navigator>
      </NavigationContainer>
    </View>
  );
}

/* TODO:
* statusBarHeight is specific to iPhone 15 and will likely look bad on other devices
* not sure why this is needed and why SafeAreaView doesn't work
* consider using react-native-status-bar-height
* my guess is that this is somehow related to the way NavigationContainer handles the status bar
*/
const statusBarHeight = 58;
const styles = StyleSheet.create({
  container: {
    minHeight: Dimensions.get('window').height,
    paddingTop: statusBarHeight,
    backgroundColor: colors.brandColor,
  },
});

export default observer(AppWrapper);