import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react';

import { AppTabParamList } from '@/types/AppNavTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';
import colors from '@/colors';

const { Navigator, Screen } = createBottomTabNavigator<AppTabParamList>();

const AppWrapper = () => {
  return (
    // View is needed to push the status bar to the bottom of the screen
    // This should not be needed.
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Navigator initialRouteName="Lists" screenOptions={screenOptions} >
          <Screen name="Lists" component={ListsNavigation} options={tabOptions({iconName: 'list-alt'})} />
          <Screen name="Groups" component={GroupsNavigation} options={tabOptions({iconName: 'groups'})} />
          <Screen name="Locations" component={LocationsNavigation} options={tabOptions({iconName: 'store'})} />
          <Screen name="Settings" component={SettingsNavigation} options={tabOptions({iconName: 'settings'})} />
        </Navigator>
      </NavigationContainer>
    </View>
  );
}

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const tabBarIconCreator = (name: MaterialIconName) => {
    return function ({ color, size }: { color: string, size: number }) {
        return <MaterialIcons name={name} color={color} size={size} />;
    }
};

// Shared tab options
const tabOptions = ({iconName}: {iconName: MaterialIconName}): BottomTabNavigationOptions => {
  return {
    tabBarIcon: tabBarIconCreator(iconName),
    tabBarShowLabel: true,
    tabBarLabelPosition: 'below-icon',
    tabBarLabelStyle: { fontWeight: 'bold', fontSize: 14 },
    tabBarActiveTintColor: colors.white,
    tabBarInactiveTintColor: colors.inactiveButtonColor,
    tabBarInactiveBackgroundColor: colors.brandColor,
    tabBarStyle: { backgroundColor: colors.brandColor, height: 90, paddingBottom: 20, paddingTop: 10 },
    tabBarItemStyle: { backgroundColor: colors.lightBrandColor },
    tabBarPosition: 'bottom',
  }
};

const screenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  lazy: false,
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