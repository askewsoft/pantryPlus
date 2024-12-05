import { Button, Modal, Text, TextInput, View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import { domainStore, ListType } from '@/stores/DomainStore';
import colors from '@/consts/colors';

const AddCategoryModal = () => {
  return (
    <Modal
      visible={uiStore.addCategoryModalVisible}
      transparent={false}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Add Category</Text>
        <TextInput
            style={styles.input}
            autoFocus={true}
            inputMode="text"
            lineBreakStrategyIOS="none"
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
            keyboardAppearance="light"
            maxLength={100}
            placeholder="Category Name"
            placeholderTextColor={colors.lightBrandColor}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
        />
        <Button
            title="Cancel"
            onPress={() => uiStore.setAddCategoryModalVisible(false)}
            color={colors.white}
        />
      </View>
    </Modal>
  );
}

const onSubmit = async (evt: any) => {
    const { selectedShoppingList: listId } = uiStore; 
    const currList = domainStore.lists.find((list) => list.id === listId);
    const user = domainStore.user;

    currList?.addCategory({ name: evt.nativeEvent.text, xAuthUser: user?.email! });
    uiStore.setAddCategoryModalVisible(false);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    opacity: 0.9,
    paddingVertical: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 60,
    color: colors.white,
  },
  input: {
    height: 40,
    minWidth: "80%",
    backgroundColor: colors.white,
    marginBottom: 30,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
  },
});

export default observer(AddCategoryModal);  