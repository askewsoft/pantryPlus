import { Text, View, StyleSheet } from 'react-native';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

export default function FeatureHighlightTemplate({ title, description, image }: { title: string, description: string, image: string | null }) {
  return (
    <View style={styles.container}>
      <Text style={styles.carouselTitle}>{title}</Text>
      <Text style={styles.carouselDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    borderRadius: 10,
  },
  carouselTitle: {
    fontSize: fonts.modalTitleSize,
    color: colors.white,
    padding: 15
  },
  carouselDescription: {
    fontSize: fonts.missingRowsTextSize,
    fontStyle: 'italic',
    color: colors.white,
    padding: 15
  }
});