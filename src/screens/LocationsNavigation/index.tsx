import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { LocationsStackParamList } from '@/types/LocationNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyLocations from './MyLocations';
import LocationDetails from './LocationDetails';

const { Navigator, Screen } = createStackNavigator<LocationsStackParamList>();

const LocationsNavigation = () => {
  return (
    <Navigator initialRouteName="MyLocations" screenOptions={stackNavScreenOptions}>
      <Screen name="MyLocations" component={MyLocations} options={{ title: 'My Locations' }} />
      <Screen name="LocationDetails" component={LocationDetails} />
    </Navigator>
  );
}

export default observer(LocationsNavigation);