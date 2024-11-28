import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/colors';

const AddListButton = ({onPress}: {onPress: () => void}) => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color={colors.white}
      backgroundColor={colors.brandColor}
      borderRadius={0}
      iconStyle={{ paddingRight: 0, paddingLeft: 0, paddingBottom: 0, paddingTop: 0 }}
      onPress={onPress}
    />
  )
}

export default observer(AddListButton);
