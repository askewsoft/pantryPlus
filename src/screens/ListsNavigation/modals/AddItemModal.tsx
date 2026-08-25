import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Modal,
  Text,
  TextInput,
  View,
  StyleSheet,
  Platform,
  Keyboard,
  Pressable,
  FlatList,
  TouchableOpacity,
  KeyboardEvent,
} from 'react-native';
import { observer } from 'mobx-react';
import DropDownPicker from 'react-native-dropdown-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';
import { api } from '@/api';
import { displayItemName } from '@/utils/itemName';
import {
  buildTypeaheadCorpus,
  findCategoryIdForItem,
  matchTypeaheadEntry,
  searchTypeaheadCorpus,
  TypeaheadEntry,
} from '@/utils/itemTypeahead';
import { setIntentTypeaheadCorpus } from '@/services/intentSync';

const TYPEAHEAD_LOOKBACK_DAYS = 365;
const PEEK_HEIGHT = '8%';
const SUGGESTIONS_PADDING = 8;
const MIN_SUGGESTION_HEIGHT = 44;

const AddItemModal = () => {
  const [itemName, setItemName] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [typeaheadCorpus, setTypeaheadCorpus] = useState<TypeaheadEntry[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TypeaheadEntry | null>(null);
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textInputRef = useRef<TextInput>(null);
  const wasCategoryOpenRef = useRef(false);

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

  const validCategoryIds = useMemo(
    () => new Set(categoryItems.map(item => item.value)),
    [categoryItems],
  );

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryId === null || selectedCategoryId === '') {
      return selectedCategoryId === '' ? 'No Category' : 'Optional';
    }
    const match = categoryItems.find(item => item.value === selectedCategoryId);
    return match?.label ?? 'Optional';
  }, [categoryItems, selectedCategoryId]);

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

  const suggestions = useMemo(() => {
    if (!isAdding || categoryOpen || hideSuggestions) return [];
    return searchTypeaheadCorpus(typeaheadCorpus, itemName);
  }, [typeaheadCorpus, itemName, isAdding, categoryOpen, hideSuggestions]);

  const showSuggestions = suggestions.length > 0;

  const resolveCategoryId = useCallback(
    (entry: TypeaheadEntry): string | undefined => {
      const fromApi = entry.categoryId;
      if (fromApi !== undefined && validCategoryIds.has(fromApi)) {
        return fromApi;
      }
      const fromList = findCategoryIdForItem(entry.id, householdListsForCategoryLookup);
      if (fromList !== undefined && validCategoryIds.has(fromList)) {
        return fromList;
      }
      return undefined;
    },
    [householdListsForCategoryLookup, validCategoryIds],
  );

  const loadTypeaheadCorpus = useCallback(async () => {
    const user = domainStore.user;
    if (!user || !currentList) return;
    const items = await api.shopper.getPurchasedItems({
      user,
      lookBackDays: TYPEAHEAD_LOOKBACK_DAYS,
      cohortId: currentList.groupId ?? null,
      listId: currentList.id,
    });
    const preferredNames = householdListsForCategoryLookup.flatMap(list => [
      ...list.items.map(item => ({ id: item.id, name: item.name })),
      ...list.categories.flatMap(category =>
        category.items.map(item => ({ id: item.id, name: item.name })),
      ),
    ]);

    // Prefer current-list category membership; fall back to same-named
    // category on other household lists when API omits categoryId.
    const categoryByItemId = new Map<string, string>();
    for (const category of currentList.categories) {
      for (const item of category.items) {
        categoryByItemId.set(item.id, category.id);
      }
    }
    for (const list of householdListsForCategoryLookup) {
      if (list.id === currentList.id) continue;
      for (const category of list.categories) {
        const localCategory = currentList.categories.find(c => c.name === category.name);
        if (!localCategory) continue;
        for (const item of category.items) {
          if (!categoryByItemId.has(item.id)) {
            categoryByItemId.set(item.id, localCategory.id);
          }
        }
      }
    }

    const itemsWithCategory = items.map(item => ({
      ...item,
      categoryId: item.categoryId ?? categoryByItemId.get(item.id),
    }));

    const corpus = buildTypeaheadCorpus(itemsWithCategory, preferredNames);
    setTypeaheadCorpus(corpus);
    setIntentTypeaheadCorpus(corpus);
  }, [currentList, householdListsForCategoryLookup]);

  const dismissWithoutSave = useCallback(() => {
    Keyboard.dismiss();
    uiStore.setAddItemModalVisible(false);
    uiStore.setEditingItemName(null);
    uiStore.setEditingItemId(null);
    uiStore.setEditingItemCategoryId(null);
    setItemName('');
    setSelectedCategoryId(null);
    setSelectedSuggestion(null);
    setHideSuggestions(false);
    setCategoryExpanded(false);
    setCategoryOpen(false);
  }, []);

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
      setHideSuggestions(false);
      setCategoryExpanded(false);
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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleNameChange = (text: string) => {
    setItemName(text);
    setSelectedSuggestion(null);
    setHideSuggestions(false);
  };

  const handleSelectSuggestion = (entry: TypeaheadEntry) => {
    setItemName(entry.name);
    setSelectedSuggestion(entry);
    const categoryId = resolveCategoryId(entry);
    if (categoryId !== undefined) {
      setSelectedCategoryId(categoryId);
    }
    setCategoryExpanded(false);
    setHideSuggestions(true);
    textInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleCategoryValueChange = (value: string | null | ((prev: string | null) => string | null)) => {
    setSelectedCategoryId(value);
    setCategoryOpen(false);
    setCategoryExpanded(false);
  };

  const renderSuggestionsList = () => (
    <FlatList
      style={styles.suggestionsList}
      keyboardShouldPersistTaps="always"
      data={suggestions}
      keyExtractor={(ranked) => ranked.entry.id}
      renderItem={({ item: ranked }) => (
        <Pressable
          style={styles.suggestionRow}
          onPress={() => handleSelectSuggestion(ranked.entry)}
        >
          <Text
            style={styles.suggestionText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayItemName(ranked.entry.name)}
          </Text>
          {ranked.matchedAlias ? (
            <Text
              style={styles.suggestionAlias}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ranked.matchedAlias}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );

  const resolveAddPayload = (trimmedName: string) => {
    const matched =
      (selectedSuggestion && displayItemName(selectedSuggestion.name) === displayItemName(trimmedName)
        ? selectedSuggestion
        : undefined) ?? matchTypeaheadEntry(typeaheadCorpus, trimmedName);
    return {
      name: matched?.name ?? trimmedName,
      upc: matched?.upc ?? '',
      id: matched?.id,
    };
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
        const itemPayload = resolveAddPayload(trimmedName);
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
      if (found) {
        itemSnapshot = { id: found.id, name: found.name, upc: found.upc };
      }
    } else {
      const found = currentList.items.find(i => i.id === itemId);
      if (found) {
        itemSnapshot = { id: found.id, name: found.name, upc: found.upc };
      }
    }

    // Also search other folders if rename moved the row
    if (!itemSnapshot) {
      for (const category of currentList.categories) {
        const found = category.items.find(i => i.id === itemId);
        if (found) {
          itemSnapshot = { id: found.id, name: found.name, upc: found.upc };
          break;
        }
      }
    }

    if (!itemSnapshot) return;

    if (newCategoryId && newCategoryId !== '') {
      await api.category.associateCategoryItem({ categoryId: newCategoryId, itemId, xAuthUser });
      currentList.categories.forEach(category => category.detachLocalItem(itemId));
      currentList.detachLocalItem(itemId);
      const newCategory = currentList.categories.find(c => c.id === newCategoryId);
      newCategory?.attachLocalItem(itemSnapshot);
    } else {
      await currentList.clearItemCategories({ itemId, xAuthUser });
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

    dismissWithoutSave();
  };

  useEffect(() => {
    if (categoryOpen) {
      Keyboard.dismiss();
    } else if (wasCategoryOpenRef.current && categoryExpanded) {
      // Collapsed after the user closed/picked from the dropdown.
      setCategoryExpanded(false);
    }
    wasCategoryOpenRef.current = categoryOpen;
  }, [categoryOpen, categoryExpanded]);

  const renderCategorySection = () => {
    if (isAdding) {
      return (
        <>
          <Pressable
            style={styles.categoryChip}
            onPress={() => setCategoryExpanded(true)}
            accessibilityRole="button"
            accessibilityLabel={`Category: ${selectedCategoryLabel}. Tap to change.`}
          >
            <Text
              style={styles.categoryChipText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Category: {selectedCategoryLabel}
            </Text>
            <MaterialIcons
              name="expand-more"
              size={iconSize.rowIconSize}
              color={colors.brandColor}
            />
          </Pressable>
          {categoryExpanded && (
            <View style={styles.dropdownContainer}>
              <DropDownPicker
                open={categoryOpen}
                value={selectedCategoryId}
                items={categoryItems}
                setOpen={setCategoryOpen}
                setValue={handleCategoryValueChange}
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
          )}
        </>
      );
    }

    return (
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={categoryOpen}
          value={selectedCategoryId}
          items={categoryItems}
          setOpen={setCategoryOpen}
          setValue={handleCategoryValueChange}
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
    );
  };

  return (
    <Modal
      visible={uiStore.addItemModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={dismissWithoutSave}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.peekZone}
          onPress={dismissWithoutSave}
          accessibilityRole="button"
          accessibilityLabel="Dismiss add item"
        >
          <View style={styles.peekScrim} />
        </Pressable>

        <View
          style={[
            styles.modalPanel,
            keyboardHeight > 0 && { paddingBottom: keyboardHeight + SUGGESTIONS_PADDING },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.formSection}>
              <View style={styles.header}>
                <Text style={styles.modalTitle}>
                  {uiStore.editingItemId ? 'Edit Item' : 'Add Item'}
                </Text>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleDone}
                    accessibilityRole="button"
                    accessibilityLabel="Done"
                  >
                    <Text style={styles.headerButtonText}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleNext}
                    accessibilityRole="button"
                    accessibilityLabel="Next"
                  >
                    <Text style={styles.headerButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
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

              {renderCategorySection()}
            </View>

            {showSuggestions && (
              <View style={styles.suggestionsFlex}>
                {renderSuggestionsList()}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  peekZone: {
    height: PEEK_HEIGHT,
    flexShrink: 0,
  },
  peekScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalPanel: {
    flex: 1,
    backgroundColor: colors.brandColor,
    paddingTop: 16,
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '90%',
    minHeight: 0,
  },
  formSection: {
    width: '100%',
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: fonts.modalTitleSize,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.lightBrandColor,
    borderRadius: 6,
  },
  headerButtonText: {
    color: colors.white,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    width: '100%',
    backgroundColor: colors.white,
    marginBottom: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: fonts.rowTextSize,
    borderRadius: 8,
  },
  suggestionsFlex: {
    flex: 1,
    minHeight: MIN_SUGGESTION_HEIGHT,
    width: '100%',
    marginTop: SUGGESTIONS_PADDING,
  },
  suggestionsList: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightBrandColor,
    borderRadius: 8,
  },
  suggestionRow: {
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightBrandColor,
  },
  suggestionText: {
    flexShrink: 1,
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  },
  suggestionAlias: {
    flexShrink: 1,
    color: colors.lightBrandColor,
    fontSize: fonts.infoTextSize,
    marginTop: 2,
  },
  categoryChip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightBrandColor,
    borderRadius: 8,
    gap: 8,
  },
  categoryChipText: {
    flex: 1,
    minWidth: 0,
    color: colors.brandColor,
    fontSize: fonts.messageTextSize,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 12,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.lightBrandColor,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderColor: colors.lightBrandColor,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownText: {
    color: colors.brandColor,
    fontSize: fonts.messageTextSize,
  },
  dropdownPlaceholder: {
    color: colors.lightBrandColor,
    fontSize: fonts.messageTextSize,
  },
});

export default observer(AddItemModal);
