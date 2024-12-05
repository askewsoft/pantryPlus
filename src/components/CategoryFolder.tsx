import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import AntDesign from '@expo/vector-icons/AntDesign';

import { uiStore } from '@/stores/UIStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';

const CategoryFolder = ({categoryId, title, children}: {categoryId: string, title: string, children: React.ReactNode}) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  return (
    <View style={styles.container}>
        <Pressable onPress={() => {
          uiStore.setOpenCategory(categoryId, !open);
        }}>
          <View style={styles.titleContainer}>
            <AntDesign
              name={open ? "folderopen" : "folder1"}
              size={fonts.listItemIconSize}
              backgroundColor={colors.lightBrandColor}
              color={colors.white}
              iconStyle={{ padding: 0, margin: 0 }}
            />
            <Text style={styles.title}>{title}</Text>
            <MaterialIcons.Button
              name="drag-indicator"
              size={fonts.listItemIconSize}
              backgroundColor={colors.lightBrandColor}
              color={colors.white}
              iconStyle={{ padding: 0, margin: 0 }}
              style={{ alignSelf: 'flex-end' }}
              // onLongPress={drag}
            />
          </View>
        </Pressable>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBrandColor,
    marginTop: 2,
    paddingLeft: 20,
    paddingVertical: 7,
  },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: fonts.listItemTextSize,
    fontWeight: 'bold',
    marginLeft: 20,
  }
});

export default observer(CategoryFolder);