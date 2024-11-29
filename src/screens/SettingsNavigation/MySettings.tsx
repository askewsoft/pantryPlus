import { View, Pressable, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { StackPropsMySettings } from '@/types/SettingsNavTypes';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const MySettings = ({ navigation }: StackPropsMySettings) => {
  const { signOut } = useAuthenticator();
  return (
    <View style={styles.container}>
      <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Profile')}>
        <MaterialIcons
          name="person"
          size={fonts.listItemIconSize}
          color={colors.brandColor}
        />
        <Text style={styles.buttonText}>Profile</Text>
      </Pressable>
      <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('Permissions')}>
        <MaterialIcons
          name="security"
          size={fonts.listItemIconSize}
          color={colors.brandColor}
        />
        <Text style={styles.buttonText}>Permissions</Text>
      </Pressable>
      <Pressable style={styles.buttonContainer} onPress={() => signOut()}>
        <MaterialIcons
          name="logout"
          size={fonts.listItemIconSize}
          color={colors.brandColor}
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
    paddingVertical: 40,
    backgroundColor: colors.detailsBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.detailsBackground,
    paddingHorizontal: 30,
    paddingVertical: 20,
    width: '100%',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: fonts.listItemTextSize,
    fontWeight: 'bold',
    color: colors.brandColor,
  }
});

export default observer(MySettings);