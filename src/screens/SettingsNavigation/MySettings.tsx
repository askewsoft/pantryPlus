import { View, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { StackPropsMySettings } from '@/types/SettingsNavTypes';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ErrorBoundary from '@/components/ErrorBoundary';
import { updateService } from '@/services/UpdateService';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';

const MySettings = ({ navigation }: StackPropsMySettings) => {
  const { signOut } = useAuthenticator();
  const logout = () => {
    domainStore.initialize();
    uiStore.initialize();
    signOut();
  }

  const checkForUpdates = async () => {
    await updateService.manualUpdateCheck();
  }

  const showUpdateInfo = () => {
    const info = updateService.getUpdateInfo();
    Alert.alert('Update Info', JSON.stringify(info, null, 2));
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons
            name="person"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Profile</Text>
          <Text style={styles.loggedInText}>[{domainStore.user?.email}]</Text>
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Permissions')}>
          <MaterialIcons
            name="security"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Permissions</Text>
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={checkForUpdates}>
          <MaterialIcons
            name="system-update"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Check for Updates</Text>
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={showUpdateInfo}>
          <MaterialIcons
            name="info"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Show Update Info</Text>
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={logout}>
          <MaterialIcons
            name="logout"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    </ErrorBoundary>
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