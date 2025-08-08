import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { LocationsStack, LocationsStackParamList } from '@/types/LocationNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyLocations from './MyLocations';
import LocationDetails from './LocationDetails';

import HamburgerButton from '@/components/Buttons/HamburgerButton';
import { uiStore } from '@/stores/UIStore';

const { Navigator, Screen } = createStackNavigator<LocationsStackParamList>();

const LocationsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Locations' && LocationsStack.includes(uiStore.lastViewedSubSection as typeof LocationsStack[number])) {
      navigation.navigate('Locations', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: any) => {
    const routesLength = e.data.state.routes.length;
    const currentRoute = e.data.state.routes[routesLength - 1].name;

    // If we're on MyLocations and we had a previous route, this was an explicit navigation
    if (currentRoute === "MyLocations" && prevRoute.current !== null) {
      uiStore.setLastViewedSubSection('');
    } else if (currentRoute !== "MyLocations") {
      uiStore.setLastViewedSubSection(currentRoute as typeof LocationsStack[number]);
    }

    prevRoute.current = currentRoute;
  }

  const onOpenDrawer = () => {
    navigation.openDrawer();
  };

  const myLocationOptions = {
    title: 'My Locations',
    headerRight: () => {
      return (
        <HamburgerButton onPress={onOpenDrawer} />
      );
    }
  };

  const locationDetailsOptions = {
    title: 'Location Details',
  };

  return (
    <Navigator initialRouteName="MyLocations" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
      <Screen name="MyLocations" component={MyLocations} options={myLocationOptions} />
      <Screen name="LocationDetails" component={LocationDetails} options={locationDetailsOptions} />
    </Navigator>
  );
}

export default observer(LocationsNavigation);