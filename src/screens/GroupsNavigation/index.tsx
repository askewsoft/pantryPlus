import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { GroupsStackParamList } from '@/types/GroupNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyGroups from './MyGroups';
import GroupDetails from './GroupDetails';

import AddGroupButton from '@/components/Buttons/AddGroupButton';

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const GroupsNavigation = () => {
  return (
    <Navigator initialRouteName="MyGroups" screenOptions={stackNavScreenOptions}>
      <Screen name="MyGroups" component={MyGroups} options={{ title: 'My Groups', headerRight: () => <AddGroupButton /> }} />
      <Screen name="GroupDetails" component={GroupDetails} />
    </Navigator>
  );
}

export default observer(GroupsNavigation);