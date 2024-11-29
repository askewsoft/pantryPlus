import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { LocationsStackParamList } from '@/types/LocationNavTypes';

import MyLocations from './MyLocations';
import LocationDetails from './LocationDetails';

import colors from '@/consts/colors';

const { Navigator, Screen } = createStackNavigator<LocationsStackParamList>();

const LocationsNavigation = () => {
  return (
    <Navigator
      initialRouteName="MyLocations"
      screenOptions={{
        headerStyle: {
          height: 40,
          backgroundColor: colors.brandColor,
        },
        headerTitleAlign: 'left',
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShown: true
      }}
    >
      <Screen name="MyLocations" component={MyLocations} options={{ title: 'My Locations' }} />
      <Screen name="LocationDetails" component={LocationDetails} />
    </Navigator>
  );
}

export default observer(LocationsNavigation);