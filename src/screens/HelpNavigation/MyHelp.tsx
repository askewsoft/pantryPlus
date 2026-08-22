import { View, Pressable, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { StackPropsMyHelp } from '@/types/HelpNavTypes';
import ErrorBoundary from '@/components/ErrorBoundary';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';

const MyHelp = ({ navigation }: StackPropsMyHelp) => {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('SiriTips')}>
          <MaterialIcons
            name="mic"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>Siri Voice Tips</Text>
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={() => navigation.navigate('About')}>
          <MaterialIcons
            name="info"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
          <Text style={styles.buttonText}>About</Text>
        </Pressable>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: colors.detailsBackground,
    paddingTop: 10,
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
  },
});

export default observer(MyHelp);
