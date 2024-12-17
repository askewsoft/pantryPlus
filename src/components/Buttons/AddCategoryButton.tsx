import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';

const AddCategoryButton = ({onPress, foreground, background}: {onPress: () => void, foreground: string, background: string}) => {
  return (
    <MaterialIcons.Button
      name="playlist-add"
      size={24}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={{ paddingRight: 0, paddingLeft: 0, paddingBottom: 0, paddingTop: 0 }}
      onPress={onPress}
    />
  )
}

export default observer(AddCategoryButton);
