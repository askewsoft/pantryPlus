import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { GroupsStackParamList } from '@/types/GroupNavTypes';

import MyGroups from './MyGroups';
import GroupDetails from './GroupDetails';

import AddGroupButton from '@/components/Buttons/AddGroupButton';
import colors from '@/colors';

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const GroupsNavigation = () => {
  return (
    <Navigator
      initialRouteName="MyGroups"
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
      <Screen name="MyGroups" component={MyGroups} options={{ title: 'My Groups', headerRight: () => <AddGroupButton /> }} />
      <Screen name="GroupDetails" component={GroupDetails} />
    </Navigator>
  );
}

export default observer(GroupsNavigation);