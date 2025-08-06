import { useEffect, useRef } from 'react';
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
import { domainStore } from '@/stores/DomainStore';

const onPressAddGroup = () => {
  // Track that user is creating a group from the Groups screen directly
  uiStore.setGroupCreationOrigin('Groups');
  uiStore.setAddGroupModalVisible(true);
};

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const renderHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <AddButton
        label="Add Group"
        onPress={onPressAddGroup}
        foreground={colors.white}
        background={colors.brandColor}
        materialIconName="add-circle"
      />
    </View>
  );
}

const GroupsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Groups' && GroupsStack.includes(uiStore.lastViewedSubSection as typeof GroupsStack[number])) {
      navigation.navigate('Groups', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh invites when Groups tab comes into focus
      domainStore.user?.getInvites();
    });

    return unsubscribe;
  }, [navigation]);

  const onScreenChange = (e: any) => {
    const routesLength = e.data.state.routes.length;
    const currentRoute = e.data.state.routes[routesLength - 1].name;

    // If we're on MyGroups and we had a previous route, this was an explicit navigation
    if (currentRoute === "MyGroups" && prevRoute.current !== null) {
      uiStore.setLastViewedSubSection('');
    } else if (currentRoute !== "MyGroups") {
      uiStore.setLastViewedSubSection(currentRoute as typeof GroupsStack[number]);
    }

    prevRoute.current = currentRoute;
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