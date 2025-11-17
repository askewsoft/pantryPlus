import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/consts/colors';

interface BadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
  transparentBackground?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ count, size = 'medium', darkMode = true, transparentBackground = false }) => {
  if (count <= 0) return null;

  const sizeStyles = {
    small: {
      container: { minWidth: 18, height: 18, borderRadius: 9 },
      text: { fontSize: 12 }
    },
    medium: {
      container: { minWidth: 22, height: 22, borderRadius: 11 },
      text: { fontSize: 14 }
    },
    large: {
      container: { minWidth: 26, height: 26, borderRadius: 13 },
      text: { fontSize: 16 }
    }
  };

  const currentSize = sizeStyles[size];
  const backgroundColor = transparentBackground ? { backgroundColor: '' } : { backgroundColor: colors.alertColor };
  const textColor = darkMode ? { color: colors.white } : { color: colors.brandColor };

  return (
    <View style={[styles.container, currentSize.container, backgroundColor]}>
      <Text style={[styles.text, currentSize.text, textColor]}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Badge;