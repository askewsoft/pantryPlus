import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react-native';

import { DomainStoreContextProvider, domainStore } from '@/models/DomainStore';
import { UIStoreContextProvider, uiStore } from '@/models/UIStore';

import AppWrapper from '@/screens/AppWrapper';
import SplashScreen from '@/screens/SplashScreen';
import amplifyConfig from '@/config/amplify';

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