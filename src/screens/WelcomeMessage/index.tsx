import { useContext, useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native';
import { observer } from 'mobx-react';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { RootStoreContext, UserType } from 'src/models/RootStore';
// import { fetchUserAttributes, FetchUserAttributesOutput } from "aws-amplify/auth";

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button onPress={signOut} title={`Sign Out`} />;
}

const WelcomeMessage = () => {
  const rootStore = useContext(RootStoreContext);
  const [userIsReady, setUserIsReady] = useState(false);
  const { route } = useAuthenticator();
  const [currUser, setCurrUser] = useState<UserType | null>(null);

  useEffect(() => {
    console.log('route:', route);
    function* getCurrUser() {
      console.log('inside getCurrUser(), route is:', route);
      console.log('userIsReady:', userIsReady);
      const authenticatedUser = (yield rootStore?.user.getUser()) as UserType;
      console.log('authenticatedUser:', authenticatedUser);
      setCurrUser(authenticatedUser);
      setUserIsReady(true);
      console.log('userIsReady:', userIsReady);
    };
    if (route === 'authenticated') {
      console.log('inside useEffect, route is:', route);
      getCurrUser();
    }
  }, [route, rootStore]);

  return (
    userIsReady && currUser && (
      <View>
        <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Welcome {currUser.nickname}!</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your ID is {currUser.sub}</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your email is {currUser.email}</Text>
        </View>
        <View style={{ padding: 30 }}>
          <SignOutButton />
        </View>
      </View>
    )
    || <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Loading...</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>User:{rootStore?.user?.nickname}</Text>
        <View style={{ padding: 30 }}>
          <SignOutButton />
        </View>
      </View>
  );
};

export default observer(WelcomeMessage);