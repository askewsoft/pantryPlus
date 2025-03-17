import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react-native';
import React from 'react';
import { LogBox } from 'react-native';

import { DomainStoreContextProvider, domainStore } from '@/stores/DomainStore';
import { UIStoreContextProvider, uiStore } from '@/stores/UIStore';

import UserContext from '@/screens/UserContext';
import SplashScreen from '@/screens/SplashScreen';
import amplifyConfig from '@/config/amplify';
import IntroScreen from '@/screens/IntroScreen';
import AppWrapper from '@/screens/AppWrapper';
import { authTheme } from '@/consts/authTheme';

Amplify.configure(amplifyConfig);

// Enable more detailed error logging
LogBox.ignoreAllLogs(); // Ignore log notifications
(console as any).reportErrorsAsExceptions = false; // Prevent error logs from triggering the red screen

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Add error boundary
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log('App Error:', error);
    console.log('Error Info:', errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null; // Return null instead of crashing
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <GestureHandlerRootView>
        <UIStoreContextProvider value={uiStore}>
          <ThemeProvider theme={authTheme}>
            <Authenticator.Provider>
              <Authenticator initialState={uiStore.signInOrUp as IAuthenticatorProps['initialState']}>
                <DomainStoreContextProvider value={domainStore}>
                  <UserContext>
                    {uiStore.lastViewedSection === 'IntroScreen' ?
                      <IntroScreen /> :
                      <AppWrapper />
                    }
                  </UserContext>
                </DomainStoreContextProvider>
              </Authenticator>
            </Authenticator.Provider>
          </ThemeProvider>
        </UIStoreContextProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default observer(App);