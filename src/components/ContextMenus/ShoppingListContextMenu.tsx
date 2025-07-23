import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { uiStore } from '@/stores/UIStore';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type ShoppingListContextMenuProps = {
  onAddCategory: () => void;
  onAddItem: () => void;
  onToggleEmptyFolders: () => void;
  onToggleAllFolders: () => void;
  onReorderCategories: () => void;
  onToggleCategoryLabels: () => void;
};

const ShoppingListContextMenu = observer(({
  onAddCategory,
  onAddItem,
  onToggleEmptyFolders,
  onToggleAllFolders,
  onReorderCategories,
  onToggleCategoryLabels,
}: ShoppingListContextMenuProps) => {
  // Single source of truth for actions and their handlers
  const actionConfigs = [
    {
      title: 'Add Item',
      systemIcon: 'plus.circle',
      handler: onAddItem,
    },
    {
      title: 'Add Category',
      systemIcon: 'folder.badge.plus',
      handler: onAddCategory,
    },
    {
      title: 'Reorder Categories',
      systemIcon: 'arrow.up.arrow.down',
      handler: onReorderCategories,
    },
    {
      title: uiStore.showEmptyFolders ? 'Hide Empty Categories' : 'Show Empty Categories',
      systemIcon: uiStore.showEmptyFolders ? 'eye.slash' : 'eye.fill',
      handler: onToggleEmptyFolders,
      showWhen: uiStore.showCategoryLabels,
    },
    {
      title: uiStore.allFoldersOpen ? 'Close All Categories' : 'Open All Categories',
      systemIcon: uiStore.allFoldersOpen ? 'folder' : 'folder.fill',
      handler: onToggleAllFolders,
      showWhen: uiStore.showCategoryLabels,
    },
    {
      title: uiStore.showCategoryLabels ? 'Hide Category Labels' : 'Show Category Labels',
      systemIcon: uiStore.showCategoryLabels ? 'tag.slash' : 'tag.fill',
      handler: onToggleCategoryLabels,
    },
  ];

  const handleActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;
    const actionConfig = actionConfigs[index];
    if (actionConfig?.handler) {
      actionConfig.handler();
    }
  };

  // Filter out actions that shouldn't be shown
  const visibleActions = actionConfigs.filter(config => config.showWhen !== false);

  return (
    <View style={styles.container}>
      <ContextMenu
        actions={visibleActions.map(({ title, systemIcon }) => ({ title, systemIcon }))}
        onPress={handleActionPress}
        dropdownMenuMode={true}
        previewBackgroundColor={colors.brandColor}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          activeOpacity={0.7}
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
    marginRight: 8,
  },
  hamburgerButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShoppingListContextMenu; 