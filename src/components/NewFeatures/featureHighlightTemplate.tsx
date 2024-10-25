import { Text, View, Image } from 'react-native';
import { styles } from './style';

export default function FeatureHighlightTemplate({ title, description, image }: { title: string, description: string, image: string | null }) {
  return (
    <View style={styles.container}>
      <Text style={styles.carouselTitle}>{title}</Text>
      <Text style={styles.carouselDescription}>{description}</Text>
    </View>
  );
}