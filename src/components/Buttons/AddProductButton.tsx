import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';

const AddProductButton = ({categoryId, dark}: {categoryId: string, dark?: boolean}) => {
  const onPress = () => {
    uiStore.setOpenCategory(categoryId, true);
    uiStore.setAddItemToCategoryID(categoryId);
  }

  return (
    <MaterialIcons.Button
      name="add-task"
      size={fonts.rowIconSize}
      color={dark ? colors.white : colors.brandColor}
      backgroundColor={dark ? colors.lightBrandColor : colors.detailsBackground}
      onPress={onPress}
    />
  )
}

export default observer(AddProductButton);
