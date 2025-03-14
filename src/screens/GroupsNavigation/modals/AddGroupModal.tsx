import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AddGroupModal = ({ navigation }: { navigation: any }) => {
  const optionallyShareShoppingList = (newGroupId: string) => {
    if (uiStore.selectedShoppingList) {
      const selectedList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
      if (selectedList) {
        selectedList.updateList({ name: selectedList.name, groupId: newGroupId, xAuthUser: domainStore.user!.email });
      }
      uiStore.setShareModalVisible(true);
      navigation.goBack();
    }
  };

  const onSubmit = async (evt: any) => {
    const newGroupId = await domainStore.addGroup(evt.nativeEvent.text);
    uiStore.setAddGroupModalVisible(false);
    optionallyShareShoppingList(newGroupId);
  };

  const onCancel = () => {
    uiStore.setAddGroupModalVisible(false);
    if (uiStore.selectedShoppingList) {
      uiStore.setShareModalVisible(true);
      navigation.goBack();
    }
  };

  return (
    <Modal
      visible={uiStore.addGroupModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create New Group</Text>
        <TextInput
            style={styles.input}
            autoFocus={true}
            inputMode="text"
            lineBreakStrategyIOS="none"
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
            keyboardAppearance="light"
            maxLength={100}
            placeholder="Group Name"
            placeholderTextColor={colors.lightBrandColor}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={onSubmit}
        />
        <Button
            title="Cancel"
            onPress={onCancel}
            color={colors.white}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    paddingVertical: 50,
    marginTop: '60%',
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

export default observer(AddGroupModal);  