import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const Permissions = () => {
  return (
    <View style={styles.container}><Text>Permissions</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(Permissions);