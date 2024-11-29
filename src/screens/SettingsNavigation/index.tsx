import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStackParamList } from '@/types/SettingsNavTypes';

import MySettings from './MySettings';

import colors from '@/consts/colors';

const { Navigator, Screen } = createStackNavigator<SettingsStackParamList>();

const SettingsNavigation = () => {
  return (
    <Navigator
      initialRouteName="MySettings"
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
      <Screen name="MySettings" component={MySettings} options={{ title: 'My Settings' }} />
    </Navigator>
  );
}

export default observer(SettingsNavigation);