import { useState, useEffect } from 'react';
import SplashScreen from 'src/views/SplashScreen/index';
import IntroScreen from 'src/views/IntroScreen/index';

export default function App() {
  const [hideSplashScreen, setHideSplashScreen] = useState(false);

  useEffect(() => {
    setHideSplashScreen(false);
    setTimeout(() => {
      setHideSplashScreen(true);
    }, 2500);
  }, []);

  if (!hideSplashScreen) {
    return <SplashScreen />;
  }
  return <IntroScreen />;
}
