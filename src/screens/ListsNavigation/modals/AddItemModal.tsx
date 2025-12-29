import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Modal, Text, TextInput, View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
  const textInputRef = useRef<TextInput>(null);

  const listId = uiStore.selectedShoppingList;
  const currentList = domainStore.lists.find((list) => list.id === listId);

  // Get category items directly from the DomainStore - always up to date
  const categoryItems = useMemo(() => {
    if (currentList) {
      // Get fresh categories from the DomainStore
      const categories = currentList.categories.map(category => ({
        label: category.name,
        value: category.id
      }));
      // Add "No Category" option
      categories.unshift({ label: 'No Category', value: '' });
      return categories;
    } else {
      // Set default "No Category" option even if no list is found
      return [{ label: 'No Category', value: '' }];
    }
  }, [currentList, currentList?.categories.length, uiStore.addItemModalVisible]);

  // Populate form when modal opens for editing or adding to a category
  useEffect(() => {
    if (uiStore.addItemModalVisible) {
      if (uiStore.editingItemName) {
        setItemName(uiStore.editingItemName);
        setSelectedCategoryId(uiStore.editingItemCategoryId);
      } else {
        // Clear form for new item, but preserve category if set
        setItemName('');
        setSelectedCategoryId(uiStore.editingItemCategoryId);
      }
    }
  }, [uiStore.addItemModalVisible, uiStore.editingItemName, uiStore.editingItemCategoryId]);

  const handleAddItem = () => {
    const trimmedName = itemName.trim();
    if (trimmedName !== '' && currentList) {
      const user = domainStore.user;
      const xAuthUser = user?.email!;

      if (uiStore.editingItemName) {
        // We're editing an existing item - handle category change if needed
        if (uiStore.editingItemCategoryId !== selectedCategoryId) {
          handleCategoryChange();
        }
        // If the name changed, we need to handle that separately
        if (trimmedName !== uiStore.editingItemName) {
          // TODO: Handle name change - this would require updating the item in place
          // For now, we'll just use the category change logic
        }
      } else {
        // Adding a new item
        if (selectedCategoryId && selectedCategoryId !== '') {
          // Add item to specific category
          const category = currentList.categories.find(c => c.id === selectedCategoryId);
          category?.addItem({
            item: { name: trimmedName, upc: '' },
            xAuthUser,
            onItemAdded: () => currentList.loadUnpurchasedItemsCount({ xAuthUser })
          });
        } else {
          // Add item to list without category
          currentList.addItem({ item: { name: trimmedName, upc: '' }, xAuthUser });
        }
      }

      // Clear the input for next item
      setItemName('');
      // Clear editing name (but preserve category for "Next" button)
      uiStore.setEditingItemName(null);
      // Note: editingItemCategoryId is only cleared in handleDone()
    }
  };

  const handleCategoryChange = () => {
    if (!currentList || !uiStore.editingItemName) return;

    const user = domainStore.user;
    const xAuthUser = user?.email!;
    const originalCategoryId = uiStore.editingItemCategoryId;
    const newCategoryId = selectedCategoryId;

    // Only proceed if category actually changed
    if (originalCategoryId === newCategoryId) return;

    // NOTE: When an Item is moved to a different category, that relationship needs to be
    // persisted to the database via the API. Currently, this implementation removes the item
    // from the original location and creates a new item in the new location, which results
    // in API calls to createItem() and associateCategoryItem()/associateListItem().
    //
    // Future consideration: Prevent duplicate Items by first looking for similarly named
    // Items when adding to a List, but this depends on how the data model unfolds in the database.

    // Find the item in the original category or list
    let itemToMove = null;
    if (originalCategoryId) {
      const originalCategory = currentList.categories.find(c => c.id === originalCategoryId);
      itemToMove = originalCategory?.items.find(i => i.name === uiStore.editingItemName);
      if (itemToMove && originalCategory) {
        // Remove from original category
        originalCategory.removeItem({
          itemId: itemToMove.id,
          xAuthUser,
          onItemRemoved: () => currentList.loadUnpurchasedItemsCount({ xAuthUser })
        });
      }
    } else {
      // Item was in the list without category
      itemToMove = currentList.items.find(i => i.name === uiStore.editingItemName);
      if (itemToMove) {
        // Remove from list
        currentList.removeItem({ itemId: itemToMove.id, xAuthUser });
      }
    }

    // Add to new category or list
    if (itemToMove) {
      if (newCategoryId && newCategoryId !== '') {
        const newCategory = currentList.categories.find(c => c.id === newCategoryId);
        newCategory?.addItem({
          item: { name: uiStore.editingItemName!, upc: itemToMove.upc || '' },
          xAuthUser,
          onItemAdded: () => currentList.loadUnpurchasedItemsCount({ xAuthUser })
        });
      } else {
        currentList.addItem({ item: { name: uiStore.editingItemName!, upc: itemToMove.upc || '' }, xAuthUser });
      }
    }
  };

  const handleNext = () => {
    // Add the current item if there's text
    if (itemName.trim() !== '') {
      handleAddItem();
    }
    // Modal stays open for next item, input is already cleared by handleAddItem
  };

  const handleDone = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    // Add the current item if there's text
    if (itemName.trim() !== '') {
      handleAddItem();
    }

    // If we're editing an item and the category has changed, save the changes
    if (uiStore.editingItemName && uiStore.editingItemCategoryId !== selectedCategoryId) {
      handleCategoryChange();
    }

    // Close modal and clean up
    uiStore.setAddItemModalVisible(false);
    uiStore.setEditingItemName(null);
    uiStore.setEditingItemCategoryId(null);
    setItemName('');
    setSelectedCategoryId(null);
  };

  // Effect to handle dropdown open/close
  useEffect(() => {
    if (categoryOpen) {
      Keyboard.dismiss();
    }
  }, [categoryOpen]);

  // Effect to handle category selection
  useEffect(() => {
    if (selectedCategoryId !== null) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [selectedCategoryId]);

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
          <Text style={styles.modalTitle}>
            {uiStore.editingItemName ? 'Edit Item' : 'Add Item'}
          </Text>

          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={categoryOpen}
              value={selectedCategoryId}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setSelectedCategoryId}
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
            ref={textInputRef}
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
            returnKeyType="none"
            blurOnSubmit={false}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Done"
              onPress={handleDone}
              color={colors.white}
            />
            <Button
              title="Next"
              onPress={handleNext}
              color={colors.white}
            />
          </View>
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
    marginTop: '50%',
  },
  modalTitle: {
    fontSize: fonts.modalTitleSize,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 60,
    color: colors.white,
  },
  input: {
    height: 40,
    minWidth: "80%",
    backgroundColor: colors.white,
    marginBottom: 15,
    padding: 10,
    textAlign: 'center',
    fontSize: fonts.rowTextSize,
  },
  dropdownContainer: {
    width: "80%",
    marginBottom: 15,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    // marginTop: 10,
  }
});

export default observer(AddItemModal);