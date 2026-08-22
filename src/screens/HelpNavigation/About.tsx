import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsAbout } from '@/types/HelpNavTypes';
import { updateService } from '@/services/UpdateService';
import { styles as sharedStyles } from '@/screens/SettingsNavigation/styles';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const About = (_props: StackPropsAbout) => {
  const aboutInfo = updateService.getAboutInfo();

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {Object.entries(aboutInfo)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => (
          <View key={key} style={sharedStyles.propertyContainer}>
            <Text style={styles.aboutLabel}>{formatKey(key)}</Text>
            <Text style={styles.aboutValue} numberOfLines={3} ellipsizeMode='tail'>
              {formatValue(value)}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  aboutLabel: {
    flex: 1,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
    verticalAlign: 'middle',
  },
  aboutValue: {
    flex: 1,
    fontSize: fonts.badgeTextSize,
    color: colors.lightBrandColor,
    backgroundColor: colors.detailsBackground,
    verticalAlign: 'middle',
    padding: 5,
    borderWidth: 1,
    borderColor: colors.inactiveButtonColor,
    borderRadius: 5,
  },
});

export default observer(About);
