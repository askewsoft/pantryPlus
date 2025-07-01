import React, { useEffect } from 'react';
import { StyleSheet, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { observer } from 'mobx-react';
import { EventArg, NavigationContainer, TabNavigationState, NavigationState, EventListenerCallback, NavigationContainerEventMap } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppTabs,AppTabsParamList } from '@/types/AppNavTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import { locationService } from '@/services/LocationService';

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
  };

  const onScreenChange: EventListenerCallback<any, 'state'> = (e) => {
    const state = e.data?.state;
    if (!state?.history?.length) return;
    
    const lastTab = state.history[state.history.length - 1];
    const routeName = lastTab.key.split('-')[0] as typeof AppTabs[number];
    if (routeName && AppTabs.includes(routeName)) {
      uiStore.setLastViewedSection(routeName);
    }
  };

  useEffect(() => {
    if (domainStore.locationEnabled) {
      locationService.startTracking();
    }
    return () => {
      if (!domainStore.locationEnabled) {
        locationService.stopTracking();
      }
    }
  }, [domainStore.locationEnabled]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <NavigationContainer>
          <Navigator initialRouteName={getInitialAppTabsRouteName()} screenOptions={screenOptions} screenListeners={{ state: onScreenChange }}>
            <Screen name="Lists" component={ListsNavigation} options={{...tabOptions({iconName: 'list-alt'}), tabBarIcon: tabBarIconCreator('list-alt')}} />
            <Screen name="Groups" component={GroupsNavigation} options={{...tabOptions({iconName: 'groups'}), tabBarIcon: tabBarIconCreator('groups')}} />
            <Screen name="Locations" component={LocationsNavigation} options={{...tabOptions({iconName: 'store'}), tabBarIcon: tabBarIconCreator('store')}} />
            <Screen name="Settings" component={SettingsNavigation} options={{...tabOptions({iconName: 'settings'}), tabBarIcon: tabBarIconCreator('settings')}} />
          </Navigator>
        </NavigationContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandColor,
  },
  keyboardContainer: {
    flex: 1,
  },
});

export default observer(AppWrapper);