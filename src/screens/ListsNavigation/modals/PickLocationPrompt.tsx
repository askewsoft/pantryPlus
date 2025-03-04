import { Button, Modal, Text, View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const PickLocationPrompt = ({onPress}: {onPress: FnReturnVoid}) => {
  return (
    <Modal
      visible={uiStore.pickLocationPromptVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Requires Location</Text>

        <Text style={styles.content}>
          Purchasing and reordering requires a location.
        </Text>
        <Text style={styles.content}>
          Press 'OK' to create or select a known location.
        </Text>
        <Text style={styles.content}>
          Then return to the shopping list to try again.
        </Text>
        <Button
            title="OK"
            onPress={onPress}
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
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: colors.alertColor,
    padding: 20,
    maxHeight: 300,
    maxWidth: 250,
    marginVertical: 'auto',
    marginHorizontal: 'auto',
    borderRadius: 20,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    fontSize: fonts.messageTextSize,
    color: colors.white,
  },
});

export default observer(PickLocationPrompt);  