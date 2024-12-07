import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import AntDesign from '@expo/vector-icons/AntDesign';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import logging from '@/config/logging';

const CategoryFolder = ({categoryId, title, children}: {categoryId: string, title: string, children: React.ReactNode}) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find(l => l.categories.find(c => c.id === categoryId));
  const currCategory = currList?.categories.find(c => c.id === categoryId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);


  const onSubmit = async (evt: any) => {
    const user = domainStore.user;
    logging.debug ? console.log(`onSubmit Edited Title: ${editedTitle}`) : null;
    logging.debug ? console.log(`currCategory: ${currCategory?.name}`) : null;
    await currCategory?.setName(editedTitle, user?.email!);
    setIsEditing(false)
  }

  return (
    <View style={styles.container}>
        <Pressable
          onPress={() =>  uiStore.setOpenCategory(categoryId, !open)}
          onLongPress={() => setIsEditing(true)}
        >
          <View style={styles.titleContainer}>
            <AntDesign
              name={open ? "folderopen" : "folder1"}
              size={fonts.listItemIconSize}
              backgroundColor={colors.lightBrandColor}
              color={colors.white}
              iconStyle={{ padding: 0, margin: 0 }}
            />
            {isEditing ? (
              <TextInput
                style={[styles.title, styles.titleInput]}
                value={editedTitle}
                onSubmitEditing={onSubmit}
                onChangeText={(text) => setEditedTitle(text)}
                autoFocus={true}
              />
            ) : (
              <Text style={styles.title}>{title}</Text>
            )}
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
  },
  titleInput: {
    backgroundColor: colors.detailsBackground,
    color: colors.lightBrandColor,
    paddingVertical: 7,
  }
});

export default observer(CategoryFolder);