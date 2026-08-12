import React from 'react';
import { View, TouchableOpacity, StyleSheet, NativeSyntheticEvent } from 'react-native';
import { observer } from 'mobx-react-lite';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type LocationContextMenuProps = {
  onRename: () => void;
};

const LocationContextMenu = observer(({ onRename }: LocationContextMenuProps) => {
  const actionConfigs = [
    {
      title: 'Rename Location',
      systemIcon: 'square.and.pencil',
      handler: onRename,
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
        actions={actionConfigs.map(({ title, systemIcon }) => ({ title, systemIcon }))}
        onPress={handleActionPress}
        dropdownMenuMode={true}
        previewBackgroundColor={colors.itemBackground}
      >
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          accessibilityLabel="Location Menu"
          accessibilityHint="Opens menu with options to rename location"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="more-horiz"
            size={iconSize.rowIconSize}
            color={colors.lightBrandColor}
          />
        </TouchableOpacity>
      </ContextMenu>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationContextMenu;
