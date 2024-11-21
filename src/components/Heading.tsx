import { observer } from 'mobx-react-lite';
import { StyleSheet } from 'react-native';
import { Text, View } from 'react-native';

const Heading = ({ children, heading }: { children: React.ReactNode, heading: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{heading}</Text>
      {children}
    </View>
  )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'purple',
    maxHeight: 70,
    minHeight: 20,
    width: '100%',
    alignSelf: 'center',
    alignContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
    padding: 10,
    justifyContent: 'space-between'
  },
  heading: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default observer(Heading);