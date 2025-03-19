import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import appConfig from '@/config/app';

const UserContext = ({children}: {children: React.ReactNode}) => {
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (appConfig.debug) {
          console.log('Starting user initialization...');
        }
        
        await domainStore.initUser();
        if (appConfig.debug) {
          console.log('User initialized successfully');
        }

        await domainStore.loadLists();
        if (appConfig.debug) {
          console.log('Lists loaded successfully');
        }

        await domainStore.loadGroups();
        if (appConfig.debug) {
          console.log('Groups loaded successfully');
        }

        await domainStore.user?.getInvites();
        if (appConfig.debug) {
          console.log('User invites retrieved successfully');
        }

        await domainStore.loadRecentLocations();
        if (appConfig.debug) {
          console.log('Recent locations loaded successfully');
        }
      } catch (error) {
        console.error('Error during user initialization:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error; // Re-throw to be caught by error boundary
      }
    };

    initializeUser();
  }, []);

  return (
    <>
      {children}
    </>
  );
}

export default observer(UserContext);