import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ItemType } from '@/stores/models/Category';
import CheckBoxButton from './Buttons/CheckBoxButton';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import logging from '@/config/logging';


const Item = ({ item, drag }: { item: ItemType, drag: () => void }) => {

  return (
    <View style={styles.itemLine}>
      <View style={styles.itemContainer}>
        <CheckBoxButton />
        <Text style={styles.item}>{item.name}</Text>
      </View>
      <MaterialIcons.Button
        name="drag-indicator"
        size={fonts.rowIconSize}
        backgroundColor={colors.itemBackground}
        color={colors.brandColor}
        iconStyle={{ padding: 0, margin: 0 }}
        style={{ alignSelf: 'flex-end' }}
        onLongPress={drag}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
    marginTop: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 30,
  },
  item: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  }
});

export default observer(Item);
