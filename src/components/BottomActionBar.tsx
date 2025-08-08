import React from 'react';
import { View, StyleSheet } from 'react-native';

import colors from '@/consts/colors';

type BottomActionBarProps = {
  children: React.ReactNode;
};

const BottomActionBar = ({ children }: BottomActionBarProps) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.brandColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 50,
    borderTopWidth: 0,
    marginTop: -1,
  },
});

export default BottomActionBar;
