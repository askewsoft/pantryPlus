import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const Profile = () => {
  return (
    <View style={styles.container}><Text>Profile</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(Profile);