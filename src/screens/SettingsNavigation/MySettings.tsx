import { View, Pressable, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { StackPropsMySettings } from '@/types/SettingsNavTypes';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const MySettings = ({ navigation }: StackPropsMySettings) => {
  const { signOut } = useAuthenticator();
  const logout = () => {
    domainStore.initialize();
    uiStore.initialize();
    signOut();
  }
  return (
    <View style={styles.container}>
      <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Profile')}>
        <MaterialIcons
          name="person"
          size={fonts.rowIconSize}
          color={colors.lightBrandColor}
        />
        <Text style={styles.buttonText}>Profile</Text>
        <Text style={styles.loggedInText}>[{domainStore.user?.email}]</Text>
      </Pressable>
      <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Permissions')}>
        <MaterialIcons
          name="security"
          size={fonts.rowIconSize}
          color={colors.lightBrandColor}
        />
        <Text style={styles.buttonText}>Permissions</Text>
      </Pressable>
      <Pressable style={styles.buttonContainer} onPress={logout}>
        <MaterialIcons
          name="logout"
          size={fonts.rowIconSize}
          color={colors.lightBrandColor}
        />
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: colors.detailsBackground,
    paddingTop: 10,
  },
  loggedInText: {
    fontSize: fonts.messageTextSize,
    color: colors.lightBrandColor,
    flexWrap: 'wrap',
    marginLeft: 10,
  },
  loggedInTextContainer: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.detailsBackground,
    paddingHorizontal: 30,
    paddingVertical: 15,
    width: '100%',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
  }
});

export default observer(MySettings);