import { Text, View, Image } from 'react-native';
import { styles } from './style';

export const carouselData = [
  { id: 1, title: 'Shopping Lists', description: 'Create lists that can be shared with others' },
  { id: 2, title: 'Customizable Categories', description: 'Create different categories per list and the order of categories location-aware' },
  { id: 3, title: 'UPC Scanner', description: 'Scan the UPC code of a product to automatically add it to your list' }
];

export default function FeatureHighlightTemplate({ title, description, image }: { title: string, description: string, image: string | null }) {
  return (
    <View style={styles.container}>
      <Text style={styles.carouselTitle}>{title}</Text>
      <Text style={styles.carouselDescription}>{description}</Text>
    </View>
  );
}