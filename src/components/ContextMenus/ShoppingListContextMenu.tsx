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
  const handleActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;
    switch (index) {
      case 0: // Add Category
        onAddCategory();
        break;
      case 1: // Add Item
        onAddItem();
        break;
      case 2: // Separator
        break;
      case 3: // Toggle Empty Folders
        onToggleEmptyFolders();
        break;
      case 4: // Toggle All Folders
        onToggleAllFolders();
        break;
      case 5: // Separator
        break;
      case 6: // Reorder Categories
        onReorderCategories();
        break;
      case 7: // Toggle Category Labels
        onToggleCategoryLabels();
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ContextMenu
        actions={[
          {
            title: 'Add Item',
            systemIcon: 'plus.circle',
          },
          {
            title: 'Add Category',
            systemIcon: 'folder.badge.plus',
          },
          {
            title: 'Reorder Categories',
            systemIcon: 'arrow.up.arrow.down',
          },
          {
            title: uiStore.showEmptyFolders ? 'Hide Empty Categories' : 'Show Empty Categories',
            systemIcon: uiStore.showEmptyFolders ? 'eye.slash' : 'eye.fill',
          },
          {
            title: uiStore.allFoldersOpen ? 'Close All Categories' : 'Open All Categories',
            systemIcon: uiStore.allFoldersOpen ? 'folder' : 'folder.fill',
          },
          {
            title: uiStore.showCategoryLabels ? 'Hide Category Labels' : 'Show Category Labels',
            systemIcon: uiStore.showCategoryLabels ? 'tag.slash' : 'tag.fill',
          },
        ]}
        onPress={handleActionPress}
        dropdownMenuMode={true}
        previewBackgroundColor={colors.brandColor}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="more-vert"
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