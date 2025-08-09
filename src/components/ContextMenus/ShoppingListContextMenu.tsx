import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import Badge from '@/components/Badge';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type ShoppingListContextMenuProps = {
  onToggleEmptyFolders: () => void;
  onToggleAllFolders: () => void;
  onReorderCategories: () => void;
  onToggleCategoryLabels: () => void;
};

const ShoppingListContextMenu = observer(({
  onToggleEmptyFolders,
  onToggleAllFolders,
  onReorderCategories,
  onToggleCategoryLabels,
}: ShoppingListContextMenuProps) => {
  // Get the current list to display the count
  const currentList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
  const unpurchasedItemsCount = currentList?.unpurchasedItemsCount ?? 0;

  // Single source of truth for actions and their handlers
  // Note: Add Item and Add Category have been moved to the bottom action bar
  const actionConfigs = [
    {
      title: 'Reorder Categories',
      systemIcon: 'arrow.up.arrow.down',
      handler: onReorderCategories,
      showWhen: (currentList?.categories?.length ?? 0) > 0,
    },
    {
      title: uiStore.showEmptyFolders ? 'Hide Empty Categories' : 'Show Empty Categories',
      systemIcon: uiStore.showEmptyFolders ? 'eye.slash' : 'eye.fill',
      handler: onToggleEmptyFolders,
      showWhen: uiStore.showCategoryLabels && (currentList?.categories?.length ?? 0) > 0,
    },
    {
      title: uiStore.allFoldersOpen ? 'Close All Categories' : 'Open All Categories',
      systemIcon: uiStore.allFoldersOpen ? 'folder' : 'folder.fill',
      handler: onToggleAllFolders,
      showWhen: uiStore.showCategoryLabels && (currentList?.categories?.length ?? 0) > 0,
    },
    {
      title: uiStore.showCategoryLabels ? 'Hide Category Labels' : 'Show Category Labels',
      systemIcon: uiStore.showCategoryLabels ? 'tag.slash' : 'tag.fill',
      handler: onToggleCategoryLabels,
      showWhen: (currentList?.categories?.length ?? 0) > 0,
    },
  ];

  const handleActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;
    const visibleActionConfig = visibleActions[index];
    if (visibleActionConfig?.handler) {
      visibleActionConfig.handler();
    }
  };

  // Filter out actions that shouldn't be shown
  const visibleActions = actionConfigs.filter(config => config.showWhen !== false);

  return (
    <View style={styles.container}>
      <Badge count={unpurchasedItemsCount} size="small" />
      <ContextMenu
        actions={visibleActions.map(({ title, systemIcon }) => ({ title, systemIcon }))}
        onPress={handleActionPress}
        dropdownMenuMode={true}
        previewBackgroundColor={colors.brandColor}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          activeOpacity={0.7}
          accessibilityLabel="Shopping List Menu"
          accessibilityHint="Opens menu with options to add items, categories, and manage list settings"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="menu"
            size={iconSize.rowIconSize}
            color={colors.white}
          />
        </TouchableOpacity>
      </ContextMenu>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  hamburgerButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShoppingListContextMenu;