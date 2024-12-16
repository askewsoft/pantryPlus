import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { TextInput, View, StyleSheet } from "react-native"
import colors from "@/consts/colors";
import fonts from "@/consts/fonts";
import { uiStore } from "@/stores/UIStore";
import { domainStore, ListType } from "@/stores/DomainStore";
import { CategoryType } from "@/stores/models/List";

type ItemInputProps = {
  list?: ListType;
  category?: CategoryType;
} & ({list: ListType} | {category: CategoryType});

const ItemInput = ({ list, category }: ItemInputProps) => {
    const { id: categoryId } = category || {};
    const { id: listId } = list || {};
    const [editedName, setEditedName] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const {addItemToCategoryID, addItemToListID} = uiStore;
    const { user } = domainStore;
    const xAuthUser = user?.email || '';

    useEffect(() => {
        if (!addItemToCategoryID && !addItemToListID) {
            setIsAddingItem(false);
        } else if (addItemToCategoryID === categoryId && uiStore.openCategories.get(categoryId)?.open) {
            setIsAddingItem(true);
        } else if (addItemToListID === listId && listId === uiStore.selectedShoppingList) {
            setIsAddingItem(true);
        } else {
            setIsAddingItem(false);
        }
    }, [addItemToCategoryID, addItemToListID]);

    const onSubmit = () => {
        const trimmedName = editedName.trim();
        if (trimmedName !== '' && (categoryId || listId)) {
            if (categoryId) {
                category?.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
            } else if (list?.id) {
                list?.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
            }
        }
        setIsAddingItem(false);
        uiStore.setAddItemToCategoryID('');
        uiStore.setAddItemToListID('');
        setEditedName('');
    }

    return (
      <View style={[styles.itemLine, { display: isAddingItem ? 'flex' : 'none' }]}>
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.item}
            value={editedName}
            placeholder="enter item name here"
            onChangeText={(text) => setEditedName(text.toLowerCase())}
            onSubmitEditing={onSubmit}
            autoFocus={true}
          />
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
    itemLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.itemBackground,
    },
    itemContainer: {
        flexDirection: 'row',
        alignContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 30,
    },
    item: {
        color: colors.brandColor,
        fontSize: fonts.rowTextSize,
        paddingHorizontal: 5,
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: colors.white,
        minWidth: '85%',
    }
});

export default observer(ItemInput);
