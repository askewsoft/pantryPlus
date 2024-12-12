import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { TextInput, View, StyleSheet } from "react-native"
import colors from "@/consts/colors";
import fonts from "@/consts/fonts";
import { uiStore } from "@/stores/UIStore";
import { domainStore } from "@/stores/DomainStore";

type ItemInputProps = {
  listId?: string;
  categoryId?: string;
} & ({listId: string} | {categoryId: string});

const ItemInput = ({ listId, categoryId }: ItemInputProps) => {
    const [editedName, setEditedName] = useState('enter item name here');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const {addItemToCategoryID, addItemToListID} = uiStore;

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
    }, [categoryId, listId, addItemToCategoryID, addItemToListID]);

    const onSubmit = () => {
        if (editedName !== '') {
            if (categoryId) {
                alert(`Submitting item: '${editedName}' to categoryId: '${categoryId}'`);
            } else if (listId) {
                alert(`Submitting item: '${editedName}' to listId: '${listId}'`);
            }
        }
        setIsAddingItem(false);
    }

    return (
      <View style={[styles.itemLine, { display: isAddingItem ? 'flex' : 'none' }]}>
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.item}
            value={editedName}
            onChangeText={(text) => setEditedName(text)}
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
