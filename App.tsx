import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { Amplify } from "aws-amplify";
import { useAuthenticator, Authenticator } from '@aws-amplify/ui-react-native';

import SplashScreen from 'src/views/SplashScreen/index';
import IntroScreen from 'src/views/IntroScreen/index';
import amplifyConfig from 'src/config/amplify';

Amplify.configure(amplifyConfig);

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button onPress={signOut} title="Sign Out" />;
}

export default function App() {
  const [hideSplashScreen, setHideSplashScreen] = useState(false);
  const [hideIntroScreen, setHideIntroScreen] = useState(false);

  useEffect(() => {
    setHideSplashScreen(false);
    setTimeout(() => {
      setHideSplashScreen(true);
    }, 2500);
  }, []);

  if (!hideSplashScreen) {
    return <SplashScreen />;
  }
  return (
    <Authenticator.Provider>
      <Authenticator>
        <IntroScreen />
        <SignOutButton />
      </Authenticator>
    </Authenticator.Provider>
  );
}