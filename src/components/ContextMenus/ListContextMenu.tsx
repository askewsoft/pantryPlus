import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type ListContextMenuProps = {
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  userIsListOwner: boolean;
};

const ListContextMenu = observer(({
  onShare,
  onRename,
  onDelete,
  userIsListOwner,
}: ListContextMenuProps) => {
  const actionConfigs = [
    {
      title: 'Share List',
      systemIcon: 'square.and.arrow.up',
      handler: onShare,
      visible: userIsListOwner,
    },
    {
      title: 'Rename List',
      systemIcon: 'pencil',
      handler: onRename,
      visible: userIsListOwner,
    },
    {
      title: 'Delete List',
      systemIcon: 'trash',
      destructive: true,
      handler: onDelete,
      visible: userIsListOwner,
    },
  ].filter(action => action.visible);

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
          style={styles.menuButton}
          activeOpacity={0.7}
          accessibilityLabel="List Menu"
          accessibilityHint="Opens menu with options to share, rename, or delete list"
          accessibilityRole="button"
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
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListContextMenu;
