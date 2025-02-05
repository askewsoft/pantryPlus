import { observer } from 'mobx-react-lite';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { GroupsStackParamList } from '@/types/GroupNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyGroups from './MyGroups';
import MyInvites from './MyInvites';
import AddButton from '@/components/Buttons/AddButton';

import colors from '@/consts/colors';
import { uiStore } from '@/stores/UIStore';

const onPressAddGroup = () => {
  uiStore.setAddGroupModalVisible(true);
};

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const renderHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <AddButton onPress={onPressAddGroup}
        foreground={colors.white}
        background={colors.brandColor}
        materialIconName="add-circle"
      />
    </View>
  );
}

const GroupsNavigation = () => {
  return (
    <Navigator initialRouteName="MyGroups" screenOptions={stackNavScreenOptions}>
      <Screen
        name="MyGroups"
        component={MyGroups}
        options={{
          title: 'My Groups',
          headerMode: 'float',
          headerRight: renderHeader,
        }}
      />
      <Screen
        name="MyInvites"
        component={MyInvites}
        options={{
          title: 'Invites',
        }}
      />
    </Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  }
});

export default observer(GroupsNavigation);