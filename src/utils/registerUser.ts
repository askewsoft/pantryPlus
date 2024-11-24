import { fetchUserAttributes } from 'aws-amplify/auth';
import { domainStore } from '@/models/DomainStore';
import api from '@/api';

export const registerUser = async () => {
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