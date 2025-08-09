import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

type HamburgerButtonProps = {
  onPress: () => void;
};

const HamburgerButton = ({ onPress }: HamburgerButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Menu"
      accessibilityHint="Opens navigation menu"
      accessibilityRole="button"
    >
      <MaterialIcons
        name="menu"
        size={iconSize.rowIconSize}
        color={colors.white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HamburgerButton;
