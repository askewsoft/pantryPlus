import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppTabParamList } from '@/types/AppNavTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';

import colors from '@/consts/colors';
import tabOptions from '@/consts/tabNavOptions';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const { Navigator, Screen } = createBottomTabNavigator<AppTabParamList>();
const screenOptions: BottomTabNavigationOptions = { headerShown: false, lazy: false };

const tabBarIconCreator = (name: MaterialIconName) => {
    return function ({ color, size }: { color: string, size: number }) {
        return <MaterialIcons name={name} color={color} size={size} />;
    }
};

const AppWrapper = () => {
  // TODO: set `initialRouteName` based on the uiStore.lastScreen value
  return (
    // View is needed to push the status bar to the bottom of the screen
    // This should not be needed.
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Navigator initialRouteName="Lists" screenOptions={screenOptions} >
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