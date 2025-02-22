import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';
import { EventArg, StackNavigationState } from '@react-navigation/native';

import { LocationsStack, LocationsStackParamList } from '@/types/LocationNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyLocations from './MyLocations';
import LocationDetails from './LocationDetails';

import AddButton from '@/components/Buttons/AddButton';
import colors from '@/consts/colors';
import { uiStore } from '@/stores/UIStore';

const { Navigator, Screen } = createStackNavigator<LocationsStackParamList>();

const LocationsNavigation = ({navigation}: {navigation: any}) => {
  useEffect(() => {
    if (uiStore.lastViewedSection === 'Locations' && LocationsStack.includes(uiStore.lastViewedSubSection as typeof LocationsStack[number])) {
      console.log('NAVIGATE lastViewedLocationsSubSection', uiStore.lastViewedSubSection);
      navigation.navigate('Locations', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: EventArg<"state", false, { state: StackNavigationState<LocationsStackParamList> }>) => {
    const lastRoute = e.data.state.routes[e.data.state.routes.length - 1];
    const routeName = lastRoute?.name as typeof LocationsStack[number];
    if (routeName && uiStore.lastViewedSection === 'Locations') {
      uiStore.setLastViewedSubSection(routeName);
      console.log('SET lastViewedLocationsSubSection', routeName);
    }
  }

  const onPressAddLocation = () => {
    uiStore.setAddLocationModalVisible(true);
  };

  const myLocationOptions = {
    title: 'My Locations',
    headerRight: () => {
      return (
        <AddButton
          foreground={colors.white}
          background={colors.brandColor}
          materialIconName="add-circle"
          onPress={onPressAddLocation}
        />
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