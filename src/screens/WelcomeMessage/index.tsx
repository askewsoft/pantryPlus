import { useContext, useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { RootStoreContext, UserType } from 'src/models/RootStore';

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button onPress={signOut} title={`Sign Out`} />;
}

const WelcomeMessage = ({...props}) => {
  //console.log('#1 WelcomeMessage');
  const [currUser, setCurrUser] = useState<UserType | null>(null);
  const rootStore = useContext(RootStoreContext);

  useEffect(() => {
    const getUser = async () => {
      //console.log('#3 inside getUser()');
      const authUser = await rootStore?.getAuthenticatedUser();
      //console.log('#9 User Returned from Action');
      setCurrUser(authUser || null);
      //console.log('#10 User Set');
    };
    //console.log('#2 calling getUser()');
    getUser();
  }, []);

  return (
    currUser && (
      <View>
        <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Welcome {currUser.nickname}!</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your ID is {currUser.sub}</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your email is {currUser.email}</Text>
        </View>
        <View style={{ padding: 30, flexDirection: 'row' }}>
          <Button title="Cancel" onPress={() => props.setShowIntroScreen(true)} />
          <SignOutButton />
        </View>
      </View>
    )
    || <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Loading...</Text>
        <View style={{ padding: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Cancel" onPress={() => props.setShowIntroScreen(true)} />
          <SignOutButton />
        </View>
      </View>
  );
};

export default observer(WelcomeMessage);