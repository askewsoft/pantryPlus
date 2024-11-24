import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react';

import { RootTabParamList } from '@/types/NavigationTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';
import colors from '@/colors';

const { Navigator, Screen } = createBottomTabNavigator<RootTabParamList>();

const AppWrapper = () => {
  return (
    // View is needed to push the status bar to the bottom of the screen
    // This should not be needed.
    <View style={styles.container}>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Navigator initialRouteName="MyLists" screenOptions={screenOptions} backBehavior="history" >
          <Screen name="MyLists" component={ListsNavigation} options={tabOptions({iconName: 'list-alt', title: 'My Lists'})} />
          <Screen name="Groups" component={GroupsNavigation} options={tabOptions({iconName: 'groups', title: 'Groups'})} />
          <Screen name="Locations" component={LocationsNavigation} options={tabOptions({iconName: 'store', title: 'Stores'})} />
          <Screen name="Settings" component={SettingsNavigation} options={tabOptions({iconName: 'settings', title: 'Profile'})} />
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
const tabOptions = ({iconName, title}: {iconName: MaterialIconName, title: string}): BottomTabNavigationOptions => {
  return {
    title: title,
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
  headerShown: true,
  headerTitleAlign: 'left',
  headerStyle: { height: 40, backgroundColor: colors.brandColor },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: 'bold' },
  lazy: false,
}

const styles = StyleSheet.create({
  container: {
    minHeight: Dimensions.get('window').height - 58
  },
});

export default observer(AppWrapper);