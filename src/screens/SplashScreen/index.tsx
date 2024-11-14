import { Text, View } from 'react-native';
import * as Application from 'expo-application';

import { styles } from './style';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.pantryLogo}>Pantry+</Text>
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>{Application.nativeApplicationVersion}</Text>
      </View>
    </View>
  );
}