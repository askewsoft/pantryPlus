import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { TextInput, View, StyleSheet } from "react-native"

import colors from "@/consts/colors";
import fonts from "@/consts/fonts";

import { uiStore } from "@/stores/UIStore";
import { domainStore } from "@/stores/DomainStore";

type ItemInputProps = {
  listId: string;
  categoryId?: string;
};

const ItemInput = ({ listId, categoryId }: ItemInputProps) => {
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
        const currList = domainStore.lists.find((list) => list.id === listId);
        if (trimmedName !== '' && (categoryId || listId)) {
            if (currList && categoryId) {
                const currCategory = currList?.categories.find(c => c.id === categoryId);
                currCategory!.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
            } else if (currList && listId) {
                currList!.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
            }
        }
        setIsAddingItem(false);
        uiStore.setAddItemToCategoryID('');
        uiStore.setAddItemToListID('');
        setEditedName('');
    }

    /* TODO:
        Move the logic up a component in the stack for deciding whether to mount the item input.
        Using isAddingItem to determine if the item input should be visible is not a good solution.
        The current implementation is more complicated than it needs to be.
        The onSubmit handler could be much simpler and the useEffect could be removed entirely.

        This also appears to be causing a race condition. The triggered error appears in the terminal:
        > [RemoteTextInput] -[RTIInputSystemClient remoteTextInputSessionWithID:performInputOperation:]
        > perform input operation requires a valid sessionID. inputModality = Keyboard, inputOperation = <null selector>, customInfoType = UIEmojiSearchOperations
        
        Issue is likely because setting the TextInput display: 'none' while also trying to handle the submit action.
        On submit, the code immediately sets isAddingItem to false, which hides the TextInput component while the keyboard might still be trying to interact with it.
    */
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
        flex: 1,
        flexDirection: 'row',
        alignContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 30,
    },
    item: {
        color: colors.brandColor,
        fontSize: fonts.rowTextSize,
        paddingHorizontal: 5,
        marginLeft: 5,
        marginRight: 30,
        marginVertical: 5,
        backgroundColor: colors.white,
        flex: 1,
    }
});

export default observer(ItemInput);
