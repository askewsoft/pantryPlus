import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

type AddProductButtonProps = {
  categoryId?: string;
  listId?: string;
  foreground?: string;
  background?: string;
} & ({categoryId: string} | {listId: string});

const AddProductButton = ({categoryId, listId, foreground, background}: AddProductButtonProps) => {
  const onPress = () => {
    if (categoryId) {
      uiStore.setOpenCategory(categoryId, true);
      uiStore.addItemToCategoryID !== categoryId ? uiStore.setAddItemToCategoryID(categoryId) : uiStore.setAddItemToCategoryID('');
    } else if (listId) {
      uiStore.setSelectedShoppingList(listId);
      uiStore.addItemToListID !== listId ? uiStore.setAddItemToListID(listId) : uiStore.setAddItemToListID('');
    }
  }

  return (
    <MaterialIcons.Button
      name="add-task"
      size={fonts.rowIconSize}
      color={foreground}
      backgroundColor={background}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      underlayColor={background}
      onPress={onPress}
    />
  )
}

export default observer(AddProductButton);