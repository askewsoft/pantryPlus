import { useState, useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native';
import { observer } from 'mobx-react';
/* TODO: use this to render the splash screen while the user is loading
    * https://docs.expo.dev/versions/latest/sdk/splash-screen/
    // import * as SplashScreen from 'expo-splash-screen';
    // SplashScreen.preventAutoHideAsync();
 */

import { Amplify } from "aws-amplify";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Authenticator } from '@aws-amplify/ui-react-native';

import { ContextProvider, rootStore, RootStoreContext, UserType } from 'src/models/RootStore';

import SplashScreen from 'src/screens/SplashScreen/index';
import IntroScreen from 'src/screens/IntroScreen/index';
import WelcomeMessage from 'src/screens/WelcomeMessage/index';
import amplifyConfig from 'src/config/amplify';

Amplify.configure(amplifyConfig);

const App = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showIntroScreen, setShowIntroScreen] = useState(true);

  useEffect(() => {
    setShowSplashScreen(true);
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 2500);
    setShowIntroScreen(false);
  }, []);

  if (showSplashScreen) {
    return <SplashScreen />;
  }
  return (
    <ContextProvider value={rootStore}>
      <Authenticator.Provider>
        <Authenticator>
          <SafeAreaView>
            <WelcomeMessage />
            {/* {showIntroScreen && <IntroScreen startWithIntroScreen={setShowIntroScreen} />}
            {!showIntroScreen && <WelcomeMessage />} */}
          </SafeAreaView>
        </Authenticator>
      </Authenticator.Provider>
    </ContextProvider>
  );
}

export default observer(App);