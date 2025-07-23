import { useState, useEffect } from 'react';
import { Button, Modal, Text, TextInput, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { observer } from 'mobx-react';
import DropDownPicker from 'react-native-dropdown-picker';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AddItemModal = () => {
  const [itemName, setItemName] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<Array<{label: string, value: string}>>([]);

  const listId = uiStore.selectedShoppingList;
  const currentList = domainStore.lists.find((list) => list.id === listId);

  // Load categories for the current list
  useEffect(() => {
    if (currentList) {
      const categories = currentList.categories.map(category => ({
        label: category.name,
        value: category.id
      }));
      // Add "No Category" option
      categories.unshift({ label: 'No Category', value: '' });
      setCategoryItems(categories);
    } else {
      // Set default "No Category" option even if no list is found
      setCategoryItems([{ label: 'No Category', value: '' }]);
    }
  }, [currentList, listId]);

  const handleAddItem = () => {
    const trimmedName = itemName.trim();
    if (trimmedName !== '' && currentList) {
      const user = domainStore.user;
      const xAuthUser = user?.email!;

      if (selectedCategoryId && selectedCategoryId !== '') {
        // Add item to specific category
        const category = currentList.categories.find(c => c.id === selectedCategoryId);
        category?.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
      } else {
        // Add item to list without category
        currentList.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
      }
      
      // Clear the input for next item
      setItemName('');
    }
  };

  const handleDone = () => {
    uiStore.setAddItemModalVisible(false);
    setItemName('');
    setSelectedCategoryId(null);
  };

  const handleSubmitEditing = () => {
    handleAddItem();
  };

  return (
    <Modal
      visible={uiStore.addItemModalVisible}
      transparent={true}
      animationType="slide"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Item</Text>
          
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={categoryOpen}
              value={selectedCategoryId}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setSelectedCategoryId}
              setItems={setCategoryItems}
              placeholder="Select Category (Optional)"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={3000}
              zIndexInverse={1000}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
          </View>

          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            autoFocus={true}
            inputMode="text"
            lineBreakStrategyIOS="none"
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
            keyboardAppearance="light"
            maxLength={100}
            placeholder="Item Name"
            placeholderTextColor={colors.lightBrandColor}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={handleSubmitEditing}
          />

         <Button
            title="Done"
            onPress={handleDone}
            color={colors.white}
         />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    paddingVertical: 20,
    marginTop: '40%',
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
  dropdownContainer: {
    width: "80%",
    marginBottom: 30,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.lightBrandColor,
    borderWidth: 1,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderColor: colors.lightBrandColor,
    borderWidth: 1,
  },
  dropdownText: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  },
  dropdownPlaceholder: {
    color: colors.lightBrandColor,
    fontSize: fonts.rowTextSize,
  }
});

export default observer(AddItemModal); 