import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react-native';
// import * as SplashScreen from 'expo-splash-screen';

/* TODO:
* - replace SplashScreen component with expo-splash-screen
*/
import { DomainStoreContextProvider, domainStore } from '@/models/DomainStore';
import { UIStoreContextProvider, uiStore } from '@/models/UIStore';

import AppWrapper from '@/screens/AppWrapper';
import SplashScreen from '@/screens/SplashScreen';
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

  useEffect(() => {
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 3000);
  }, []);

  if (showSplashScreen) {
    return <SplashScreen />;
  }
  return (
    <UIStoreContextProvider value={uiStore}>
      <Authenticator.Provider>
        <Authenticator initialState={uiStore.signInOrUp as IAuthenticatorProps['initialState']}>
          <DomainStoreContextProvider value={domainStore}>
            <AppWrapper />
          </DomainStoreContextProvider>
        </Authenticator>
      </Authenticator.Provider>
    </UIStoreContextProvider>
  );
}

export default observer(App);