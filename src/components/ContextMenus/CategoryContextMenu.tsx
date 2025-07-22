import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type CategoryContextMenuProps = {
  onRename: () => void;
  onDelete: () => void;
};

const CategoryContextMenu = observer(({
  onRename,
  onDelete,
}: CategoryContextMenuProps) => {
  // Single source of truth for actions and their handlers
  const actionConfigs = [
    {
      title: 'Rename Category',
      systemIcon: 'pencil',
      handler: onRename,
    },
    {
      title: 'Delete Category',
      systemIcon: 'trash',
      destructive: true,
      handler: onDelete,
    },
  ];

  const handleActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;
    const actionConfig = actionConfigs[index];
    if (actionConfig?.handler) {
      actionConfig.handler();
    }
  };

  return (
    <View style={styles.container}>
      <ContextMenu
        actions={actionConfigs.map(({ title, systemIcon, destructive }) => ({ title, systemIcon, destructive }))}
        onPress={handleActionPress}
        dropdownMenuMode={true}
        previewBackgroundColor={colors.lightBrandColor}
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

export default CategoryContextMenu; 