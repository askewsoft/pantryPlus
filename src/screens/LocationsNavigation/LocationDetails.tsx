import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const LocationDetails = () => {
  return (
    <View style={styles.container}><Text>Location Details</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(LocationDetails);