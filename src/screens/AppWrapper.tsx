import { SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { fetchUserAttributes } from 'aws-amplify/auth';

// screens
import IntroScreen from '@/screens/IntroScreen';
import WelcomeMessage from '@/screens/WelcomeMessage';
import MyListsScreen from '@/screens/MyLists';

// models
import { domainStore } from '@/models/DomainStore';
import { uiStore } from '@/models/UIStore';

// api
import api from '@/api';

const registerUser = async () => {
    // Persist new users to the DB via the API
    let authenticatedUser;
    let userAttributes;
    try {
        userAttributes = await fetchUserAttributes();
    } catch(error) {
        console.error('Unable to fetch user attributes:', error);
        throw error;
    }

    authenticatedUser = {
      email: userAttributes.email || '',
      id: userAttributes.sub || '',
      nickName: userAttributes.nickname || ''
    };

    try {
        await api.shopper.createShopper(authenticatedUser);
        domainStore.initUser(authenticatedUser);
    } catch(error) {
        console.error('Unable to create shopper:', error);
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
        <MyListsScreen />
      }
    </SafeAreaView>
  );
}

export default observer(AppWrapper);