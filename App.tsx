import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react-native';
// import * as SplashScreen from 'expo-splash-screen';

import { DataStoreContextProvider, domainStore } from '@/models/DataStore';
import { UIStoreContextProvider, uiStore } from '@/models/UIStore';

import SplashScreen from '@/screens/SplashScreen/index';
import IntroScreen from '@/screens/IntroScreen/index';
import WelcomeMessage from '@/screens/WelcomeMessage/index';
import amplifyConfig from '@/config/amplify';

Amplify.configure(amplifyConfig);

// SplashScreen.preventAutoHideAsync();
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

interface IAuthenticatorProps {
  initialState: 'signIn' | 'signUp' | 'forgotPassword';
}

const App = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showIntroScreen, setShowIntroScreen] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 2500);
  }, []);

  if (showSplashScreen) {
    return <SplashScreen />;
  }
  return (
    <UIStoreContextProvider value={uiStore}>
      <Authenticator.Provider>
        <Authenticator initialState={uiStore.signInOrUp as IAuthenticatorProps['initialState']}>
          <DataStoreContextProvider value={domainStore}>
              <SafeAreaView>
                {showIntroScreen && <IntroScreen setShowIntroScreen={setShowIntroScreen} />}
                {!showIntroScreen && <WelcomeMessage setShowIntroScreen={setShowIntroScreen} />}
              </SafeAreaView>
          </DataStoreContextProvider>
        </Authenticator>
      </Authenticator.Provider>
    </UIStoreContextProvider>
  );
}

export default observer(App);