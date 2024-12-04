import { View, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import AntDesign from '@expo/vector-icons/AntDesign';

import { uiStore } from '@/stores/UIStore';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const CategoryFolder = ({categoryId, title, children}: {categoryId: string, title: string, children: React.ReactNode}) => {
  console.log({categoryId});
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  return (
    <View style={styles.container}>
        <Pressable onPress={() => {
          uiStore.setOpenCategory(categoryId, !open);
        }}>
          <View style={styles.titleContainer}>
              <AntDesign.Button
                name={open ? "folderopen" : "folder1"}
                size={fonts.listItemIconSize}
                backgroundColor={colors.lightBrandColor}
                color={colors.white}
                iconStyle={{ padding: 0, margin: 0 }}
              />
            <Text style={styles.title}>{title}</Text>
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
  title: {
    color: colors.white,
    fontSize: fonts.listItemTextSize,
    fontWeight: 'bold',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBrandColor,
    marginTop: 2,
  }
});

export default observer(CategoryFolder);