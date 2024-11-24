import { SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { registerUser } from '@/utils/registerUser';

const UserContext = ({children}: {children: React.ReactNode}) => {
  useEffect(() => {
    registerUser();
  }, []);

  return (
    <SafeAreaView>
      {children}
    </SafeAreaView>
  );
}

export default observer(UserContext);