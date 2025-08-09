import { Button, Modal, Text, TextInput, View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AddCategoryModal = () => {
  return (
    <Modal
      visible={uiStore.addCategoryModalVisible}
      transparent={true}
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
            blurOnSubmit={true}
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
    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    currList?.addCategory({
        name: evt.nativeEvent.text,
        xAuthUser: user?.email!,
        xAuthLocation,
        defaultOpen: uiStore.allFoldersOpen
    });
    uiStore.setAddCategoryModalVisible(false);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    marginTop: '50%',
  },
  modalTitle: {
    fontSize: fonts.modalTitleSize,
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
    fontSize: fonts.rowTextSize,
  },
});

export default observer(AddCategoryModal);