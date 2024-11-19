import { SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { fetchUserAttributes } from 'aws-amplify/auth';

// screens
import IntroScreen from '@/screens/IntroScreen';
import WelcomeMessage from '@/screens/WelcomeMessage';

// models
import { domainStore } from '@/models/DomainStore';
import { uiStore } from '@/models/UIStore';

// api
import api from '@/api';

const registerUser = async () => {
    // Persist new users to the DB via the API
    try {
        const attributes = await fetchUserAttributes();
        const authenticatedUser = {
          email: attributes.email || '',
          id: attributes.sub || '',
          nickName: attributes.nickname || ''
        };
        const response = await api.shopper.createShopper(authenticatedUser);
        domainStore.initUser(authenticatedUser);
    }
    catch(error) {
        console.error('Unable to fetchUserAttributes:', error);
        throw error;
    }
};

const AppWrapper = () => {
  useEffect(() => {
    registerUser();
  }, []);

  return (
    <SafeAreaView>
      {uiStore.lastScreen === 'IntroScreen' ?
        <IntroScreen /> :
        <WelcomeMessage />
      }
    </SafeAreaView>
  );
}

export default observer(AppWrapper);