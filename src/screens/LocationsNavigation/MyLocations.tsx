import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const MyLocations = () => {
  return (
    <View style={styles.container}><Text>My Locations</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(MyLocations);