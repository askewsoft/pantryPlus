import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import fonts from '@/consts/fonts';

const AddShopperButton = ({onPress, foreground, background}: {onPress: () => void, foreground: string, background: string}) => {
  return (
    <MaterialIcons.Button
      name="person-add-alt"
      size={fonts.rowIconSize}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      onPress={onPress}
    />
  )
}

export default observer(AddShopperButton);