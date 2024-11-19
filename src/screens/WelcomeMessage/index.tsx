import { Button, View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { domainStore, UserType } from '@/models/DomainStore';
import { uiStore } from '@/models/UIStore';

function SignOutButton() {
  const { signOut } = useAuthenticator();

  const handleSignOut = () => {
    domainStore.initialize();
    signOut();
    uiStore.setLastScreen('IntroScreen');
  }
  return <Button onPress={handleSignOut} title={`Sign Out`} />;
}

const WelcomeMessage = () => {
  const currUser = domainStore.user;

  return (
    currUser && (
      <View>
        <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Welcome {currUser.nickName}!</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your ID is {currUser.id}</Text>
          <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Your email is {currUser.email}</Text>
        </View>
        <View style={{ padding: 30, flexDirection: 'row' }}>
          <Button title="Cancel" onPress={() => uiStore.setLastScreen('IntroScreen')} />
          <SignOutButton />
        </View>
      </View>
    )
    || <View style={{ padding: 30, marginBottom: 60, marginTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 50 }}>Loading...</Text>
        <View style={{ padding: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Cancel" onPress={() => uiStore.setLastScreen('IntroScreen')} />
          <SignOutButton />
        </View>
      </View>
  );
};

export default observer(WelcomeMessage);