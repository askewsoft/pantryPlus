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
    const { user } = domainStore;
    const xAuthUser = user?.email || '';

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
        uiStore.setAddItemToCategoryID('');
        uiStore.setAddItemToListID('');
        setEditedName('');
    }

    return (
      <View style={styles.itemLine}>
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.itemBackground,
        borderRadius: 5,
        marginHorizontal: 5,
        marginVertical: 5,
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'flex-start',
        alignItems: 'center',
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
