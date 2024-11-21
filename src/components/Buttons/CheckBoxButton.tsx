import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
// import { useNavigation } from '@react-navigation/native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// TODO: Add check box functionality
const CheckBoxButton = () => {
  return (
    <MaterialIcons.Button
      name="check-box-outline-blank"
      size={24}
      backgroundColor="white"
      color="purple"
      iconStyle={{ padding: 0, margin: 0 }}
      onPress={() => {
      }}
    />
  );
};

export default observer(CheckBoxButton);