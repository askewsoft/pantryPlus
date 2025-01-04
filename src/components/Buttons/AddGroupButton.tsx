import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const AddGroupButton = () => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color="white"
      backgroundColor="purple"
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      onPress={() => {}}
    />
  )
}

export default observer(AddGroupButton);