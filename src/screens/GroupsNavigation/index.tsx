import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { GroupsStackParamList } from '@/types/GroupNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyGroups from './MyGroups';

import AddGroupButton from '@/components/Buttons/AddGroupButton';
import colors from '@/consts/colors';
import { uiStore } from '@/stores/UIStore';

const onPressAddGroup = () => {
  uiStore.setAddGroupModalVisible(true);
};

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const GroupsNavigation = () => {
  return (
    <Navigator initialRouteName="MyGroups" screenOptions={stackNavScreenOptions}>
      <Screen
        name="MyGroups"
        component={MyGroups}
        options={{
          title: 'My Groups',
          headerMode: 'float',
          headerRight: () =>
            <AddGroupButton onPress={onPressAddGroup}
              foreground={colors.white}
              background={colors.brandColor}
            />
        }}
      />
    </Navigator>
  );
}

export default observer(GroupsNavigation);