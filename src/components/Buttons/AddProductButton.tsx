import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AddProductButton = ({onPress, dark}: {onPress: () => void, dark?: boolean}) => {
  return (
    <MaterialIcons.Button
      name="add-task"
      size={fonts.listItemIconSize}
      color={dark ? colors.white : colors.brandColor}
      backgroundColor={dark ? colors.lightBrandColor : colors.detailsBackground}
      onPress={onPress}
    />
  )
}

export default observer(AddProductButton);
