import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { GroupsStack, GroupsStackParamList } from '@/types/GroupNavTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';

import MyGroups from './MyGroups';
import MyInvites from './MyInvites';
import HamburgerButton from '@/components/Buttons/HamburgerButton';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';

const { Navigator, Screen } = createStackNavigator<GroupsStackParamList>();

const GroupsNavigation = ({navigation}: {navigation: any}) => {
  // Add a ref to track the previous route so we can detect when the user navigates to a non-default screen explicitly
  const prevRoute = useRef<string | null>(null);

  const onOpenDrawer = () => {
    navigation.openDrawer();
  };

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
          headerLeft: () => <HamburgerButton onPress={onOpenDrawer} />,
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

export default observer(GroupsNavigation);