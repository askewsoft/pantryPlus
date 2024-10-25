import { View, Text, Button, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

import { styles } from './style';
import FeatureHighlightTemplate from 'src/components/NewFeatures/featureHighlightTemplate';
import { carouselData } from 'src/components/NewFeatures/carouselData';

export default function IntroScreen() {
  const { width, height } = Dimensions.get('window');
  const carouselWidth = width * 0.8;
  const carouselHeight = height * 0.4;
  const progress = useSharedValue(0);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.pantryLogo}>Pantry+</Text>
      </View>
      <View style={styles.introContainer}>
        <View style={styles.introTextContainer}>
          <Text style={styles.introText}>Explain some features</Text>
          <Carousel
            width={carouselWidth}
            height={carouselHeight}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.85,
              parallaxScrollingOffset: 40
            }}
            data={carouselData}
            renderItem={({ item }) => (
              <FeatureHighlightTemplate title={item.title} description={item.description} image={null} />
            )}
            onProgressChange={(offsetProgress, absoluteProgress) => {
              progress.value = absoluteProgress;
            }}
          />
        </View>
        <View style={styles.carouselControlsContainer}>
          <Button title="Let's begin!" />
        </View>
      </View>
    </View>
  );
}
