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
import AddProductButton from './Buttons/AddProductButton';

const CategoryFolder = ({categoryId, title, drag, children}: {categoryId: string, title: string, drag: () => void, children: React.ReactNode}) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find(l => l.categories.find(c => c.id === categoryId));
  const currCategory = currList?.categories.find(c => c.id === categoryId);
  const xAuthUser = domainStore.user?.email!;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const onSubmit = async () => {
    await currCategory?.setName(editedTitle, xAuthUser);
    setIsEditing(false)
  }

  const toggleFolderOpenClose = () => {
    /* We only ever want one input box for adding an item.
       If we're closing the folder and we're adding an item to this category,
       then clear the addItemToCategoryID
    */
    if (open && uiStore.addItemToCategoryID === categoryId) {
      logging.debug ? console.log(`toggleFolderOpenClose - clearing addItemToCategoryID: ${uiStore.addItemToCategoryID}`) : null;
      uiStore.setAddItemToCategoryID('');
    }
    uiStore.setOpenCategory(categoryId, !open);
  }

  return (
    <View style={styles.container}>
        <Pressable
          onPress={toggleFolderOpenClose}
          onLongPress={() => setIsEditing(true)}
        >
          <View style={styles.titleContainer}>
            <AntDesign
              name={open ? "folderopen" : "folder1"}
              size={fonts.rowIconSize}
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
            {/* TODO: encapsulate drag-indicator in a custom button */}
            <View style={styles.buttonContainer}>
              <AddProductButton categoryId={categoryId} foreground={colors.white} background={colors.lightBrandColor} />
              <MaterialIcons.Button
                name="drag-indicator"
                size={fonts.rowIconSize}
                color={colors.white}
                backgroundColor={colors.lightBrandColor}
                onLongPress={drag}
              />
            </View>
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
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  titleInput: {
    backgroundColor: colors.detailsBackground,
    color: colors.lightBrandColor,
    paddingVertical: 7,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
  }
});

export default observer(CategoryFolder);