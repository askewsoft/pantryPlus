import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Amplify } from "aws-amplify";
import { SignUpInput, SignUpOutput, signUp } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react-native';
// import * as SplashScreen from 'expo-splash-screen';

/* TODO:
* - figure out if we need an AppContainer react component as child of Authenticator component
* - store new user in DB during signup
* - replace SplashScreen component with expo-splash-screen
*/
import { ShoppersApi, Configuration } from 'pantryPlusApiClient';
import { DomainStoreContextProvider, domainStore } from '@/models/DomainStore';
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

const configuration = new Configuration({
  basePath: process.env.EXPO_PUBLIC_API_URL,
});

const shoppersApi = new ShoppersApi(configuration);

interface IAuthenticatorProps {
  initialState: 'signIn' | 'signUp' | 'forgotPassword';
}

const handleSignUp = async (input: SignUpInput): Promise<SignUpOutput> => {
  console.log('handleSignUp:', JSON.stringify(input));
  // store new user in DB
  try {
    const response = await shoppersApi.createShopper(input);
    console.log('response:', JSON.stringify(response));
  } catch (error) {
    console.error('error:', error);
  }
  return signUp(input);
}

const authenticatorServices = {
  handleSignUp: handleSignUp
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
        <Authenticator services={authenticatorServices} initialState={uiStore.signInOrUp as IAuthenticatorProps['initialState']}>
          <DomainStoreContextProvider value={domainStore}>
              <SafeAreaView>
                {uiStore.lastScreen === 'IntroScreen' ?
                  <IntroScreen /> :
                  <WelcomeMessage />
                }
              </SafeAreaView>
          </DomainStoreContextProvider>
        </Authenticator>
      </Authenticator.Provider>
    </UIStoreContextProvider>
  );
}

export default observer(App);