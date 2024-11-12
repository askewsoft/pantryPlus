import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { observer } from 'mobx-react-lite';

import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react-native';

import { ContextProvider, rootStore } from 'src/models/RootStore';

import SplashScreen from 'src/screens/SplashScreen/index';
import IntroScreen from 'src/screens/IntroScreen/index';
import WelcomeMessage from 'src/screens/WelcomeMessage/index';
import amplifyConfig from 'src/config/amplify';

Amplify.configure(amplifyConfig);

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
      <Authenticator.Provider>
        <Authenticator>
          <ContextProvider value={rootStore}>
            <SafeAreaView>
              {showIntroScreen && <IntroScreen setShowIntroScreen={setShowIntroScreen} />}
              {!showIntroScreen && <WelcomeMessage setShowIntroScreen={setShowIntroScreen} />}
            </SafeAreaView>
          </ContextProvider>
        </Authenticator>
      </Authenticator.Provider>
  );
}

export default observer(App);