import { useState, useEffect } from 'react';
import { Button, SafeAreaView, View, Text } from 'react-native';
import { Amplify } from "aws-amplify";
import { useAuthenticator, Authenticator } from '@aws-amplify/ui-react-native';

import SplashScreen from 'src/views/SplashScreen/index';
import IntroScreen from 'src/views/IntroScreen/index';
import amplifyConfig from 'src/config/amplify';

Amplify.configure(amplifyConfig);

function SignOutButton(){
  const { signOut } = useAuthenticator();
  return <Button onPress={signOut} title={`Sign Out`} />;
}

function WelcomeMessage() {
  const { user } = useAuthenticator();
  const userEmail = user.signInDetails?.loginId;
  const userId = user.userId;
  return (
    <View>
      <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Welcome {userEmail}</Text>
        <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your ID is {userId}</Text>
      </View>
      <View style={{ padding: 30 }}>
        <SignOutButton />
      </View>
    </View>
  );
}

export default function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showIntroScreen, setShowIntroScreen] = useState(true);

  useEffect(() => {
    setShowSplashScreen(true);
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
        <SafeAreaView>
          {showIntroScreen && <IntroScreen startWithIntroScreen={setShowIntroScreen} />}
          {!showIntroScreen && <WelcomeMessage />}
        </SafeAreaView>
      </Authenticator>
    </Authenticator.Provider>
  );
}