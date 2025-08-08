import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStack, SettingsStackParamList } from '@/types/SettingsNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import HamburgerButton from '@/components/Buttons/HamburgerButton';

import MySettings from './MySettings';
import Profile from './Profile';
import Permissions from './Permissions';
import About from './About';
import { uiStore } from '@/stores/UIStore';

const { Navigator, Screen } = createStackNavigator<SettingsStackParamList>();

const SettingsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Settings' && SettingsStack.includes(uiStore.lastViewedSubSection as typeof SettingsStack[number])) {
      navigation.navigate('Settings', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: any) => {
    const routesLength = e.data.state.routes.length;
    const currentRoute = e.data.state.routes[routesLength - 1].name;

    // If we're on MySettings and we had a previous route, this was an explicit navigation
    if (currentRoute === "MySettings" && prevRoute.current !== null) {
      uiStore.setLastViewedSubSection('');
    } else if (currentRoute !== "MySettings") {
      uiStore.setLastViewedSubSection(currentRoute as typeof SettingsStack[number]);
    }

    prevRoute.current = currentRoute;
  }

  const onOpenDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <Navigator initialRouteName="MySettings" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
      <Screen
        name="MySettings"
        component={MySettings}
        options={{
          title: 'My Settings',
          headerRight: () => <HamburgerButton onPress={onOpenDrawer} />
        }}
      />
      <Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
      <Screen name="Permissions" component={Permissions} options={{ title: 'Permissions' }} />
      <Screen name="About" component={About} options={{ title: 'About' }} />
    </Navigator>
  );
}

export default observer(SettingsNavigation);