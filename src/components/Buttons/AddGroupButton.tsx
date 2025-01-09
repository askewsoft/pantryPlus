import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const AddGroupButton = ({onPress, foreground, background}: {onPress: () => void, foreground: string, background: string}) => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      onPress={onPress}
    />
  )
}

export default observer(AddGroupButton);