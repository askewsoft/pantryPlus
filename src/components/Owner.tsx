import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import Ionicons from '@expo/vector-icons/Ionicons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';
import { iconStyle } from '@/consts/iconButtons';
import { ShopperType } from '@/stores/DomainStore';

const Owner = ({ owner, indent }: { owner: ShopperType, indent: number }) => {
  return (
    <View style={[styles.itemLine, { paddingLeft: indent }]}>
      <View style={styles.itemContainer}>
        <Ionicons name="person-circle-outline" size={iconSize.rowIconSize} color={colors.lightBrandColor} style={iconStyle} />
        <Text style={styles.item}>{owner.nickname}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
    borderRadius: 5,
    margin: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
  },
  item: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
    padding: 10
  }
});

export default observer(Owner);