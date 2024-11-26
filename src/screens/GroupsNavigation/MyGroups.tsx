import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

const MyGroups = () => {
  return (
    <View style={styles.container}><Text>My Groups</Text></View>
  );
}

const styles = StyleSheet.create({
  container: {}
});

export default observer(MyGroups);