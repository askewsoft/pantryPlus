import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const MySettings = () => {
  return (
    <View style={styles.container}><Text>My Settings</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(MySettings);