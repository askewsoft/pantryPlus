import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react-native';
import React from 'react';
import { LogBox, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import appConfig from '@/config/app';
import cognitoConfig from '@/config/cognito';

import { DomainStoreContextProvider, domainStore } from '@/stores/DomainStore';
import { UIStoreContextProvider, uiStore } from '@/stores/UIStore';

import UserContext from '@/screens/UserContext';
import amplifyConfig from '@/config/amplify';
import IntroScreen from '@/screens/IntroScreen';
import AppWrapper from '@/screens/AppWrapper';
import { authTheme } from '@/consts/authTheme';
import ErrorBoundary from '@/components/ErrorBoundary';
import { updateService } from '@/services/UpdateService';

Amplify.configure(amplifyConfig);

// Add startup logging
console.log('App starting with config:', {
  apiUrl: appConfig.apiUrl,
  debug: appConfig.debug,
  userPoolRegion: cognitoConfig.userPoolRegion,
  hasUserPoolId: !!cognitoConfig.userPoolId,
  hasUserPoolClientId: !!cognitoConfig.userPoolClientId
});

// Basic logging setup
const log = (message: string, ...args: any[]) => {
  if (__DEV__ || process.env.EXPO_PUBLIC_DEBUG === 'true') {
    console.log(`[PantryPlus] ${message}`, ...args);
  }
};

// Initialize Hermes
const isHermes = () => !!(global as any).HermesInternal;
log('🚀 Running on Hermes?', isHermes());

if (isHermes()) {
  // Add any Hermes-specific initialization here
  require('react-native/Libraries/Core/InitializeCore');
}

// Enable more detailed error logging
LogBox.ignoreAllLogs(); // Ignore log notifications
(console as any).reportErrorsAsExceptions = false; // Prevent error logs from triggering the red screen

// Override console.error to get more details
const originalConsoleError = console.error;
console.error = (...args) => {
  log('Error:', ...args);
  originalConsoleError.apply(console, args);
};

interface IAuthenticatorProps {
  initialState: 'signIn' | 'signUp' | 'forgotPassword';
}

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Keep the splash screen visible while we check for app updates
        await SplashScreen.preventAutoHideAsync();
        await updateService.checkForUpdates();
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        console.log('Finished checking for app updates');
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    }

    prepareApp();
  }, []);

  if (!isReady) {
    return null; // This will keep the splash screen visible
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
};

export default observer(App);