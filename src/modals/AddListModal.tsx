import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { randomUUID } from 'expo-crypto';

import { uiStore } from '@/stores/UIStore';
import { observer } from 'mobx-react';
import { domainStore, ListType } from '@/stores/DomainStore';
import colors from '@/colors';
import { ListModel } from '@/stores/models/List';

const AddListModal = () => {
  return (
    <Modal
      visible={uiStore.addListModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create New List</Text>
        <TextInput
            style={styles.input}
            autoFocus={true}
            inputMode="text"
            lineBreakStrategyIOS="none"
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
            keyboardAppearance="light"
            maxLength={100}
            placeholder="List Name"
            placeholderTextColor={colors.lightBrandColor}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
        />
        <Button
            title="Cancel"
            onPress={() => uiStore.setAddListModalVisible(false)}
            color={colors.white}
        />
      </View>
    </Modal>
  );
}

const onSubmit = async (evt: any) => {
    const newList: ListType = ListModel.create({
        id: randomUUID(),
        name: evt.nativeEvent.text,
        userIsOwner: true,
        groupId: undefined,
        categories: [],
    });
    domainStore.addList(newList);
    uiStore.setAddListModalVisible(false);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    opacity: 0.9,
    marginVertical: 50,
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

export default observer(AddListModal);  