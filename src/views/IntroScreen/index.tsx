import { View, Text, Button, Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import { styles } from './style';

export default function IntroScreen() {
  const { width, height } = Dimensions.get('window');
  const progress = useSharedValue(0);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.pantryLogo}>Pantry+</Text>
      </View>
      <View style={styles.introContainer}>
        <Carousel
          width={width}
          height={height}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 40
          }}
        />
        <View style={styles.introTextContainer}>
          <Text style={styles.introText}>Explain some features</Text>
        </View>
        <View style={styles.carouselControlsContainer}>
          <Button title="Let's begin!" />
        </View>
      </View>
    </View>
  );
}
