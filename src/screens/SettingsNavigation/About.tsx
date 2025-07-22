import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { StackPropsAbout } from '@/types/SettingsNavTypes';
import { updateService } from '@/services/UpdateService';
import { styles as sharedStyles } from './styles';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const About = ({ navigation }: StackPropsAbout) => {
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
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
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
}

const styles = StyleSheet.create({
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