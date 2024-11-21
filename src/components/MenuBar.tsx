import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
// import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// const navigation = useNavigation();

const menuItems = [
    {
        name: 'My Lists',
        icon: 'home',
        onPress: () => {
            // navigation.navigate('MyLists');
        }
    },
    {
        name: 'Groups',
        icon: 'groups',
        onPress: () => {
            // navigation.navigate('Groups');
        }
    },
    {
        name: 'Locations',
        icon: 'store',
        onPress: () => {
            // navigation.navigate('Locations');
        }
    },
    {
        name: 'Settings',
        icon: 'settings',
        onPress: () => {
            // navigation.navigate('Profile');
        }
    }
];

const MenuBar = () => {
  return <View style={styles.container}>
    {menuItems.map((item) => (
      <MaterialIcons.Button
        key={item.name}
        name={item.icon as any}
        size={30}
        color="white"
        backgroundColor="purple"
        borderRadius={20}
        iconStyle={{ paddingRight: 0, paddingLeft: 10, paddingBottom: 10, paddingTop: 3 }}
        onPress={item.onPress}
      />
    ))}
  </View>
}

const styles = StyleSheet.create({
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
  }
});

export default observer(MenuBar);