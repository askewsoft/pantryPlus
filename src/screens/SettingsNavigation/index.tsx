import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { BottomTabPropsSettings } from '@/types/NavigationTypes';

const SettingsNavigation = ({route, navigation}: BottomTabPropsSettings) => {
  return (
    <View><Text>Settings</Text></View>
  );
}

export default observer(SettingsNavigation);