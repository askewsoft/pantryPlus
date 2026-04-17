import { View, Text, Button, Dimensions, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';

import { styles } from './style';
import colors from '@/consts/colors';
import FeatureHighlightTemplate from '@/components/NewFeatures/featureHighlightTemplate';
import { carouselData } from '@/components/NewFeatures/carouselData';
import { uiStore } from '@/stores/UIStore';

const IntroScreen = () => {
  const { width, height } = Dimensions.get('window');
  const carouselWidth = width * 0.8;
  const carouselHeight = height * 0.4;

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.pantryLogo}>pantryPlus</Text>
      </View>
      <View style={styles.introContainer}>
        <View style={styles.introTextContainer}>
          <Text style={styles.introText}>Explain some features</Text>
          <FlatList
            data={carouselData}
            keyExtractor={(item) => String(item.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: carouselWidth, height: carouselHeight, alignSelf: 'center' }}
            snapToInterval={carouselWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            getItemLayout={(_, index) => ({
              length: carouselWidth,
              offset: carouselWidth * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={{ width: carouselWidth, height: carouselHeight }}>
                <FeatureHighlightTemplate title={item.title} description={item.description} image={null} />
              </View>
            )}
          />
        </View>
        <View style={styles.carouselControlsContainer}>
          <Button 
            title="Let's begin!" 
            onPress={() => uiStore.setLastViewedSection('Lists')} 
            color={colors.brandColor}
            accessibilityLabel="Let's begin!"
          />
        </View>
      </View>
    </View>
  );
}

export default observer(IntroScreen);