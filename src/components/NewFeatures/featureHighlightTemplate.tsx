import { Text, View, StyleSheet } from 'react-native';

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
    backgroundColor: '#841584',
  },
  carouselTitle: {
    fontSize: 36,
    color: 'white',
    padding: 15
  },
  carouselDescription: {
    fontSize: 24,
    fontStyle: 'italic',
    color: 'white',
    padding: 15
  }
});