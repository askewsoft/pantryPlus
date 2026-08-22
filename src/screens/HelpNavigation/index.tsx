import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createStackNavigator } from '@react-navigation/stack';

import { HelpStack, HelpStackParamList } from '@/types/HelpNavTypes';
import { AppSubTabsMstType } from '@/types/NavMSTTypes';
import stackNavScreenOptions from '@/consts/stackNavOptions';
import HamburgerButton from '@/components/Buttons/HamburgerButton';
import { uiStore } from '@/stores/UIStore';

import MyHelp from './MyHelp';
import SiriTips from './SiriTips';
import About from './About';

const { Navigator, Screen } = createStackNavigator<HelpStackParamList>();

const HelpNavigation = ({ navigation }: { navigation: any }) => {
  const prevRoute = useRef<string | null>(null);

  useEffect(() => {
    if (uiStore.lastViewedSection === 'Help' && HelpStack.includes(uiStore.lastViewedSubSection as typeof HelpStack[number])) {
      navigation.navigate('Help', { screen: uiStore.lastViewedSubSection });
    }
  }, []);

  const onScreenChange = (e: any) => {
    const routesLength = e.data.state.routes.length;
    const currentRoute = e.data.state.routes[routesLength - 1].name;

    if (currentRoute === 'MyHelp' && prevRoute.current !== null) {
      uiStore.setLastViewedSubSection('');
    } else if (currentRoute !== 'MyHelp') {
      uiStore.setLastViewedSubSection(currentRoute as AppSubTabsMstType);
    }

    prevRoute.current = currentRoute;
  };

  const onOpenDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <Navigator initialRouteName="MyHelp" screenOptions={stackNavScreenOptions} screenListeners={{ state: onScreenChange }}>
      <Screen
        name="MyHelp"
        component={MyHelp}
        options={{
          title: 'Help',
          headerLeft: () => <HamburgerButton onPress={onOpenDrawer} />,
        }}
      />
      <Screen name="SiriTips" component={SiriTips} options={{ title: 'Siri Voice Tips' }} />
      <Screen name="About" component={About} options={{ title: 'About' }} />
    </Navigator>
  );
};

export default observer(HelpNavigation);
