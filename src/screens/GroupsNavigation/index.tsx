import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { EventArg, StackNavigationState } from '@react-navigation/native';

import { GroupsStack, GroupsStackParamList } from '@/types/GroupNavTypes';
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

const GroupsNavigation = ({navigation}: {navigation: any}) => {
  useEffect(() => {
    if (uiStore.lastViewedSection === 'Groups' && GroupsStack.includes(uiStore.lastViewedSubSection as typeof GroupsStack[number])) {
      console.log('NAVIGATE lastViewedGroupsSubSection', uiStore.lastViewedSubSection);
      navigation.navigate('Groups', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: EventArg<"state", false, { state: StackNavigationState<GroupsStackParamList> }>) => {
    const lastRoute = e.data.state.routes[e.data.state.routes.length - 1];
    const routeName = lastRoute?.name as typeof GroupsStack[number];
    if (routeName && uiStore.lastViewedSection === 'Groups') {
      uiStore.setLastViewedSubSection(routeName);
      console.log('SET lastViewedGroupsSubSection', routeName);
    }
  }

  return (
    <Navigator initialRouteName="MyGroups" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
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