import React, { useEffect } from 'react';
import { StyleSheet, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { observer } from 'mobx-react';
import { NavigationContainer, EventListenerCallback } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppTabs, AppTabsParamList } from '@/types/AppNavTypes';
import ListsNavigation from './ListsNavigation';
import SettingsNavigation from './SettingsNavigation';
import GroupsNavigation from './GroupsNavigation';
import LocationsNavigation from './LocationsNavigation';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import { locationService } from '@/services/LocationService';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const { Navigator, Screen } = createDrawerNavigator<AppTabsParamList>();

// Icon configuration for drawer items
const getDrawerIcon = (iconName: string) => ({ color, size }: { color: string, size: number }) => (
  <MaterialIcons name={iconName as any} size={size} color={color} />
);

const AppWrapper = () => {
  const screenOptions: DrawerNavigationOptions = {
    headerShown: false,
    drawerActiveTintColor: colors.white,
    drawerInactiveTintColor: colors.brandColor,
    drawerActiveBackgroundColor: colors.lightBrandColor,
    drawerInactiveBackgroundColor: 'transparent',
    drawerLabelStyle: {
      fontSize: fonts.messageTextSize,
      fontWeight: '600',
    },
    drawerItemStyle: {
      borderRadius: 8,
    },
    drawerStyle: {
      backgroundColor: colors.detailsBackground,
      width: 200,
    },
    drawerContentStyle: {
      paddingTop: 25
    },
  };

  const getInitialRouteName = (): typeof AppTabs[number] => {
    return AppTabs.includes(uiStore.lastViewedSection as typeof AppTabs[number]) ? uiStore.lastViewedSection as typeof AppTabs[number] : 'Lists';
  };

  const onScreenChange: EventListenerCallback<any, 'state'> = (e) => {
    const state = e.data?.state;
    if (!state?.routes?.length) return;

    const currentRoute = state.routes[state.index];
    const routeName = currentRoute?.name as typeof AppTabs[number];
    if (routeName && AppTabs.includes(routeName)) {
      uiStore.setLastViewedSection(routeName);
    }
  };

  useEffect(() => {
    const shouldTrack = domainStore.locationEnabled && !!domainStore.user?.email;
    if (shouldTrack) {
      locationService.startTracking();
    } else if (!domainStore.locationEnabled) {
      locationService.stopTracking();
    } else {
      // Location enabled but user not ready yet (e.g. still authenticating)
      locationService.stopTracking(false);
    }
    return () => {
      locationService.stopTracking(false);
    };
  }, [domainStore.locationEnabled, domainStore.user?.email]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <NavigationContainer>
          <Navigator
            initialRouteName={getInitialRouteName()}
            screenOptions={screenOptions}
            screenListeners={{ state: onScreenChange }}
          >
            <Screen
              name="Lists"
              component={ListsNavigation}
              options={{
                title: 'Lists',
                drawerIcon: getDrawerIcon('list-alt')
              }}
            />
            <Screen
              name="Groups"
              component={GroupsNavigation}
              options={{
                title: 'Groups',
                drawerIcon: getDrawerIcon('groups')
              }}
            />
            <Screen
              name="Locations"
              component={LocationsNavigation}
              options={{
                title: 'Locations',
                drawerIcon: getDrawerIcon('store')
              }}
            />
            <Screen
              name="Settings"
              component={SettingsNavigation}
              options={{
                title: 'Settings',
                drawerIcon: getDrawerIcon('settings')
              }}
            />
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