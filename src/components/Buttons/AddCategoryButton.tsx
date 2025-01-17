import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const AddCategoryButton = ({onPress, foreground, background}: {onPress: () => void, foreground: string, background: string}) => {
  return (
    <MaterialIcons.Button
      name="create-new-folder"
      size={24}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      underlayColor={background}
      onPress={onPress}
    />
  )
}

export default observer(AddCategoryButton);
