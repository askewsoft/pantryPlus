import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type ItemContextMenuProps = {
  onRemove: () => void;
  onAssignToCategory: () => void;
};

const ItemContextMenu = observer(({
  onRemove,
  onAssignToCategory,
}: ItemContextMenuProps) => {
  const actionConfigs = [
    {
      title: 'Assign Category',
      systemIcon: 'folder',
      handler: onAssignToCategory,
    },
    {
      title: 'Remove Item',
      systemIcon: 'trash',
      destructive: true,
      handler: onRemove,
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
        previewBackgroundColor={colors.itemBackground}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="more-horiz"
            size={iconSize.rowIconSize}
            color={colors.brandColor}
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

export default ItemContextMenu; 