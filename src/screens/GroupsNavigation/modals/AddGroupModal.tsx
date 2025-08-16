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
      // Don't show the share modal - the list is already shared with the new group
      // User can manually reopen it if they want to see details or change sharing
      navigation.goBack();
    }
  };

  const handleGroupCreation = async (newGroupId: string) => {
    uiStore.setAddGroupModalVisible(false);

    // Handle sharing based on origin context
    if (uiStore.groupCreationOrigin === 'Lists') {
      // User came from Lists context, update the shopping list and show share modal
      // The optionallyShareShoppingList function will handle navigation back to Lists
      optionallyShareShoppingList(newGroupId);
    }
    // If from Groups context, just stay on Groups screen (modal closes)

    // Clear the origin tracking
    uiStore.clearGroupCreationOrigin();
  };

  const onSubmit = async (evt: any) => {
    const newGroupId = await domainStore.addGroup(evt.nativeEvent.text);
    handleGroupCreation(newGroupId);
  };

  const onCancel = () => {
    const origin = uiStore.groupCreationOrigin;
    uiStore.setAddGroupModalVisible(false);
    uiStore.clearGroupCreationOrigin();

    // Only handle sharing if user came from Lists context
    if (origin === 'Lists') {
      // Show the share modal - the existing navigation will handle going back to Lists
      uiStore.setShareModalVisible(true);
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

export default observer(AddGroupModal);