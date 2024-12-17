import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';

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
      onPress={onPress}
    />
  )
}

export default observer(AddProductButton);