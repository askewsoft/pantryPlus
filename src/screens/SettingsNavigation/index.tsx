import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStackParamList } from '@/types/SettingsNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MySettings from './MySettings';

import Profile from './Profile';
import Permissions from './Permissions';

const { Navigator, Screen } = createStackNavigator<SettingsStackParamList>();

const SettingsNavigation = () => {
  return (
    <Navigator initialRouteName="MySettings" screenOptions={stackNavScreenOptions}>
      <Screen name="MySettings" component={MySettings} options={{ title: 'My Settings' }} />
      <Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
      <Screen name="Permissions" component={Permissions} options={{ title: 'Permissions' }} />
    </Navigator>
  );
}

export default observer(SettingsNavigation);