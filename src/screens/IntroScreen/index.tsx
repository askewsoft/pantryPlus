import { View, Text, Button, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

import { styles } from './style';
import colors from '@/colors';
import FeatureHighlightTemplate from '@/components/NewFeatures/featureHighlightTemplate';
import { carouselData } from '@/components/NewFeatures/carouselData';
import { uiStore } from '@/models/UIStore';

const IntroScreen = () => {
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
              parallaxScrollingScale: 0.80,
              parallaxScrollingOffset: 80
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
          <Button title="Let's begin!" onPress={() => uiStore.setLastScreen('MyLists')} color={colors.brandColor} />
        </View>
      </View>
    </View>
  );
}

export default observer(IntroScreen);