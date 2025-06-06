import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import { domainStore, ListType } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

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
            blurOnSubmit={true}
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
    domainStore.addList(evt.nativeEvent.text);
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

export default observer(AddListModal);  