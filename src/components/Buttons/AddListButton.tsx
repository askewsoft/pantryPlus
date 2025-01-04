import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const AddListButton = ({onPress, dark}: {onPress: () => void, dark?: boolean}) => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color={dark ? colors.white : colors.brandColor}
      backgroundColor={dark ? colors.brandColor : colors.detailsBackground}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      onPress={onPress}
    />
  )
}

export default observer(AddListButton);
