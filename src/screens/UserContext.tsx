import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';

const UserContext = ({children}: {children: React.ReactNode}) => {
  useEffect(() => {
    try {
        domainStore.initUser();
        domainStore.loadLists();
    } catch (error) {
        console.error('Unable to initialize user:', error);
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
}

export default observer(UserContext);