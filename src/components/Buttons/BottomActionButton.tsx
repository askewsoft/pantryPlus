import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

type BottomActionButtonProps = {
  label: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  disabled?: boolean;
};

const BottomActionButton = ({
  label,
  iconName,
  onPress,
  disabled = false,
}: BottomActionButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityHint={`Tap to ${label.toLowerCase()}`}
      accessibilityRole="button"
    >
      <MaterialIcons
        name={iconName}
        size={24}
        color={disabled ? colors.inactiveButtonColor : colors.white}
      />
      <Text style={[
        styles.buttonText,
        disabled && styles.buttonTextDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: colors.inactiveButtonColor,
  },
  buttonText: {
    color: colors.white,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonTextDisabled: {
    color: colors.inactiveButtonColor,
  },
});

export default BottomActionButton;
