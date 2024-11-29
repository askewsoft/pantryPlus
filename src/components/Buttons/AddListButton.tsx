import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';

const AddListButton = ({onPress, dark}: {onPress: () => void, dark?: boolean}) => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color={dark ? colors.white : colors.brandColor}
      backgroundColor={dark ? colors.brandColor : colors.detailsBackground}
      borderRadius={0}
      iconStyle={{ paddingRight: 0, paddingLeft: 0, paddingBottom: 0, paddingTop: 0 }}
      onPress={onPress}
    />
  )
}

export default observer(AddListButton);
