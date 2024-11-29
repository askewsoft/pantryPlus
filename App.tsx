import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react-native';

import { DomainStoreContextProvider, domainStore } from '@/stores/DomainStore';
import { UIStoreContextProvider, uiStore } from '@/stores/UIStore';

import UserContext from '@/screens/UserContext';
import SplashScreen from '@/screens/SplashScreen';
import amplifyConfig from '@/config/amplify';
import IntroScreen from '@/screens/IntroScreen';
import AppWrapper from '@/screens/AppWrapper';

Amplify.configure(amplifyConfig);

interface IAuthenticatorProps {
  initialState: 'signIn' | 'signUp' | 'forgotPassword';
}

const App = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 3000);
  }, []);

  if (showSplashScreen) {
    return <SplashScreen />;
  }
  return (
    <GestureHandlerRootView>
      <UIStoreContextProvider value={uiStore}>
        <Authenticator.Provider>
        <Authenticator initialState={uiStore.signInOrUp as IAuthenticatorProps['initialState']}>
          <DomainStoreContextProvider value={domainStore}>
            <UserContext>
              {uiStore.lastScreen === 'IntroScreen' ?
                <IntroScreen /> :
                <AppWrapper />
              }
            </UserContext>
          </DomainStoreContextProvider>
          </Authenticator>
        </Authenticator.Provider>
      </UIStoreContextProvider>
    </GestureHandlerRootView>
  );
}

export default observer(App);