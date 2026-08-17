import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Modal, Text, TextInput, View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { observer } from 'mobx-react';
import DropDownPicker from 'react-native-dropdown-picker';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { api } from '@/api';
import { isCaseOnlyNameChange } from '@/utils/itemName';

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
      // Get fresh categories from the DomainStore, sorted alphabetically by name
      const sortedCategories = [...currentList.categories].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const categories = sortedCategories.map(category => ({
        label: category.name,
        value: category.id
      }));
      // Add "No Category" option at the top
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

  const handleAddItem = async () => {
    const trimmedName = itemName.trim();
    if (trimmedName !== '' && currentList) {
      const user = domainStore.user;
      const xAuthUser = user?.email!;

      if (uiStore.editingItemId) {
        if (isCaseOnlyNameChange(uiStore.editingItemName ?? '', trimmedName)) {
          await handleCasingChange(trimmedName);
        }
        // Semantic rename (non-case-only) is #163
        if (uiStore.editingItemCategoryId !== selectedCategoryId) {
          await handleCategoryChange();
        }
      } else {
        // Adding a new item via find-or-create
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
      uiStore.setEditingItemId(null);
      // Note: editingItemCategoryId is only cleared in handleDone()
    }
  };

  const findEditingItem = () => {
    if (!currentList || !uiStore.editingItemId) return undefined;
    const itemId = uiStore.editingItemId;
    if (uiStore.editingItemCategoryId) {
      const category = currentList.categories.find(c => c.id === uiStore.editingItemCategoryId);
      return category?.items.find(i => i.id === itemId);
    }
    return currentList.items.find(i => i.id === itemId);
  };

  /** Case-only display rename; identity (id / NAME_NORMALIZED) stays the same. */
  const handleCasingChange = async (newName: string) => {
    const user = domainStore.user;
    const xAuthUser = user?.email!;
    const item = findEditingItem();
    if (!item) return;
    await item.setName(newName, xAuthUser);
  };

  /**
   * Move an existing item between categories (or to/from uncategorized) without minting a new ITEM.
   */
  const handleCategoryChange = async () => {
    if (!currentList || !uiStore.editingItemId) return;

    const user = domainStore.user;
    const xAuthUser = user?.email!;
    const itemId = uiStore.editingItemId;
    const originalCategoryId = uiStore.editingItemCategoryId;
    const newCategoryId = selectedCategoryId;

    if (originalCategoryId === newCategoryId) return;

    // Locate the item in local state
    let itemSnapshot: { id: string; name: string; upc?: string } | null = null;
    if (originalCategoryId) {
      const originalCategory = currentList.categories.find(c => c.id === originalCategoryId);
      const found = originalCategory?.items.find(i => i.id === itemId);
      if (found && originalCategory) {
        itemSnapshot = { id: found.id, name: found.name, upc: found.upc };
        await api.category.unlinkCategoryItem({ categoryId: originalCategoryId, itemId, xAuthUser });
        await originalCategory.removeItem({ itemId, xAuthUser });
      }
    } else {
      const found = currentList.items.find(i => i.id === itemId);
      if (found) {
        itemSnapshot = { id: found.id, name: found.name, upc: found.upc };
        currentList.detachLocalItem(itemId);
      }
    }

    if (!itemSnapshot) return;

    if (newCategoryId && newCategoryId !== '') {
      await api.category.associateCategoryItem({ categoryId: newCategoryId, itemId, xAuthUser });
      const newCategory = currentList.categories.find(c => c.id === newCategoryId);
      newCategory?.attachLocalItem(itemSnapshot);
    } else {
      // Uncategorized: ensure list membership locally (server already has LIST_ITEM_RELATION)
      currentList.attachLocalItem(itemSnapshot);
    }

    currentList.loadUnpurchasedItemsCount({ xAuthUser });
  };

  const handleNext = async () => {
    if (itemName.trim() !== '') {
      await handleAddItem();
    }
  };

  const handleDone = async () => {
    Keyboard.dismiss();

    const wasEditing = Boolean(uiStore.editingItemId);
    const categoryChanged = uiStore.editingItemCategoryId !== selectedCategoryId;

    if (itemName.trim() !== '') {
      await handleAddItem();
    } else if (wasEditing && categoryChanged) {
      await handleCategoryChange();
    }

    uiStore.setAddItemModalVisible(false);
    uiStore.setEditingItemName(null);
    uiStore.setEditingItemId(null);
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
            {uiStore.editingItemId ? 'Edit Item' : 'Add Item'}
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
            autoCapitalize="none"
            autoCorrect={false}
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
  }
});

export default observer(AddItemModal);
