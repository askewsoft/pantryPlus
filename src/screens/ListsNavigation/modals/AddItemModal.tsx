import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Button,
  Modal,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  FlatList,
} from 'react-native';
import { observer } from 'mobx-react';
import DropDownPicker from 'react-native-dropdown-picker';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { api } from '@/api';
import { displayItemName } from '@/utils/itemName';
import {
  dedupeTypeaheadCorpus,
  findCategoryIdForItem,
  searchTypeaheadCorpus,
  TypeaheadEntry,
} from '@/utils/itemTypeahead';

const TYPEAHEAD_LOOKBACK_DAYS = 365;

const AddItemModal = () => {
  const [itemName, setItemName] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [typeaheadCorpus, setTypeaheadCorpus] = useState<TypeaheadEntry[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TypeaheadEntry | null>(null);
  const textInputRef = useRef<TextInput>(null);

  const listId = uiStore.selectedShoppingList;
  const currentList = domainStore.lists.find((list) => list.id === listId);
  const isAdding = !uiStore.editingItemId;

  const categoryItems = useMemo(() => {
    if (currentList) {
      const sortedCategories = [...currentList.categories].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const categories = sortedCategories.map(category => ({
        label: category.name,
        value: category.id
      }));
      categories.unshift({ label: 'No Category', value: '' });
      return categories;
    }
    return [{ label: 'No Category', value: '' }];
  }, [currentList, currentList?.categories.length, uiStore.addItemModalVisible]);

  const suggestions = useMemo(() => {
    if (!isAdding || categoryOpen) return [];
    return searchTypeaheadCorpus(typeaheadCorpus, itemName);
  }, [typeaheadCorpus, itemName, isAdding, categoryOpen]);

  /** Lists to search for an item's category: current list first, then rest of household. */
  const householdListsForCategoryLookup = useMemo(() => {
    if (!currentList) return [];
    const cohortId = currentList.groupId ?? null;
    const others = domainStore.lists.filter(list => {
      if (list.id === currentList.id) return false;
      if (cohortId) return list.groupId === cohortId;
      return list.groupId == null && list.ownerId === currentList.ownerId;
    });
    return [currentList, ...others];
  }, [currentList, domainStore.lists.length, currentList?.groupId]);

  const loadTypeaheadCorpus = useCallback(async () => {
    const user = domainStore.user;
    if (!user || !currentList) return;
    const items = await api.shopper.getPurchasedItems({
      user,
      lookBackDays: TYPEAHEAD_LOOKBACK_DAYS,
      cohortId: currentList.groupId ?? null,
    });
    setTypeaheadCorpus(dedupeTypeaheadCorpus(items));
  }, [currentList]);

  useEffect(() => {
    if (uiStore.addItemModalVisible) {
      if (uiStore.editingItemName) {
        setItemName(uiStore.editingItemName);
        setSelectedCategoryId(uiStore.editingItemCategoryId);
      } else {
        setItemName('');
        setSelectedCategoryId(uiStore.editingItemCategoryId);
      }
      setSelectedSuggestion(null);
      if (!uiStore.editingItemId) {
        loadTypeaheadCorpus();
      }
    }
  }, [
    uiStore.addItemModalVisible,
    uiStore.editingItemName,
    uiStore.editingItemCategoryId,
    uiStore.editingItemId,
    loadTypeaheadCorpus,
  ]);

  const handleNameChange = (text: string) => {
    setItemName(text);
    setSelectedSuggestion(null);
  };

  const handleSelectSuggestion = (entry: TypeaheadEntry) => {
    setItemName(entry.name);
    setSelectedSuggestion(entry);
    const categoryId = findCategoryIdForItem(entry.id, householdListsForCategoryLookup);
    if (categoryId !== undefined) {
      setSelectedCategoryId(categoryId);
    }
    textInputRef.current?.focus();
  };

  const buildAddItemPayload = (trimmedName: string) => {
    const payload: { name: string; upc: string; id?: string } = {
      name: trimmedName,
      upc: selectedSuggestion?.upc ?? '',
    };
    if (selectedSuggestion && displayItemName(selectedSuggestion.name) === displayItemName(trimmedName)) {
      payload.id = selectedSuggestion.id;
    }
    return payload;
  };

  const handleAddItem = async () => {
    const trimmedName = itemName.trim();
    if (trimmedName !== '' && currentList) {
      const user = domainStore.user;
      const xAuthUser = user?.email!;

      if (uiStore.editingItemId) {
        const originalName = uiStore.editingItemName ?? '';
        if (displayItemName(trimmedName) !== displayItemName(originalName)) {
          await handleRename(trimmedName);
        }
        if (uiStore.editingItemCategoryId !== selectedCategoryId) {
          await handleCategoryChange();
        }
      } else {
        const itemPayload = buildAddItemPayload(trimmedName);
        if (selectedCategoryId && selectedCategoryId !== '') {
          const category = currentList.categories.find(c => c.id === selectedCategoryId);
          category?.addItem({
            item: itemPayload,
            xAuthUser,
            onItemAdded: () => currentList.loadUnpurchasedItemsCount({ xAuthUser })
          });
        } else {
          currentList.addItem({ item: itemPayload, xAuthUser });
        }
      }

      setItemName('');
      setSelectedSuggestion(null);
      uiStore.setEditingItemName(null);
      uiStore.setEditingItemId(null);
    }
  };

  const handleRename = async (newName: string) => {
    if (!currentList || !uiStore.editingItemId) return;
    const user = domainStore.user;
    const xAuthUser = user?.email!;
    const saved = await currentList.renameItem({
      itemId: uiStore.editingItemId,
      name: newName,
      xAuthUser,
    });
    if (!saved) return;
    uiStore.setEditingItemId(saved.id);
    uiStore.setEditingItemName(saved.name);
  };

  const handleCategoryChange = async () => {
    if (!currentList || !uiStore.editingItemId) return;

    const user = domainStore.user;
    const xAuthUser = user?.email!;
    const itemId = uiStore.editingItemId;
    const originalCategoryId = uiStore.editingItemCategoryId;
    const newCategoryId = selectedCategoryId;

    if (originalCategoryId === newCategoryId) return;

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
    setSelectedSuggestion(null);
  };

  useEffect(() => {
    if (categoryOpen) {
      Keyboard.dismiss();
    }
  }, [categoryOpen]);

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
            onChangeText={handleNameChange}
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

          {suggestions.length > 0 && (
            <FlatList
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              data={suggestions}
              keyExtractor={(entry) => entry.id}
              renderItem={({ item: entry }) => (
                <Pressable
                  style={styles.suggestionRow}
                  onPress={() => handleSelectSuggestion(entry)}
                >
                  <Text style={styles.suggestionText}>{entry.name}</Text>
                </Pressable>
              )}
            />
          )}

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
    marginBottom: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: fonts.rowTextSize,
  },
  suggestionsList: {
    width: '80%',
    maxHeight: 160,
    backgroundColor: colors.white,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.lightBrandColor,
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightBrandColor,
  },
  suggestionText: {
    color: colors.brandColor,
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
