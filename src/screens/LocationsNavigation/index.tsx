import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { LocationsStackParamList } from '@/types/LocationNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyLocations from './MyLocations';
import LocationDetails from './LocationDetails';

import AddButton from '@/components/Buttons/AddButton';
import colors from '@/consts/colors';
import { uiStore } from '@/stores/UIStore';

const { Navigator, Screen } = createStackNavigator<LocationsStackParamList>();

const LocationsNavigation = () => {
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
    <Navigator initialRouteName="MyLocations" screenOptions={stackNavScreenOptions}>
      <Screen name="MyLocations" component={MyLocations} options={myLocationOptions} />
      <Screen name="LocationDetails" component={LocationDetails} options={locationDetailsOptions} />
    </Navigator>
  );
}

export default observer(LocationsNavigation);