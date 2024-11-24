import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { BottomTabPropsLocations } from '@/types/NavigationTypes';

const LocationsNavigation = ({route, navigation}: BottomTabPropsLocations) => {
  return (
    <View><Text>Locations</Text></View>
  );
}

export default observer(LocationsNavigation);