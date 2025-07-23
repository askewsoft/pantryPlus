import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import AntDesign from '@expo/vector-icons/AntDesign';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import Badge from './Badge';
import CategoryContextMenu from './ContextMenus/CategoryContextMenu';

const CategoryFolder = ({categoryId, title, drag, children, scrollViewRef}: {categoryId: string, title: string, drag: FnReturnVoid, children: React.ReactNode, scrollViewRef?: React.RefObject<any>}) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find(l => l.categories.find(c => c.id === categoryId));
  const currCategory = currList?.categories.find(c => c.id === categoryId);
  const xAuthUser = domainStore.user?.email!;
  const categoryRef = useRef<View>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  // Calculate unpurchased items count for this category
  // Since purchased items are removed from the category, all items are unpurchased
  const unpurchasedItemsCount = currCategory ? 
    currCategory.items.length : 0;

  const onSubmit = async () => {
    if (editedTitle.trim().toLowerCase() !== currCategory?.name.trim().toLowerCase()) {
      const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
      await currCategory?.setName(editedTitle, xAuthUser, xAuthLocation);
    }
    setIsEditing(false);
  }

  const onRenameCategory = () => {
    setEditedTitle(currCategory!.name!);
    setIsEditing(true);
  }

  const onDeleteCategory = () => {
    const xAuthUser = domainStore.user?.email!;
    currList?.removeCategory({ categoryId, xAuthUser });
  }

  const toggleFolderOpenClose = () => {
    uiStore.setOpenCategory(categoryId, !open);
  }

  return (
    <ScaleDecorator activeScale={1.04}>
      <View ref={categoryRef} style={styles.container}>
          <Pressable
            onPress={toggleFolderOpenClose}
          >
            <View style={styles.titleContainer}>
              <AntDesign
                name={open ? "folderopen" : "folder1"}
                size={iconSize.rowIconSize}
                backgroundColor={colors.lightBrandColor}
                color={colors.white}
                iconStyle={{ padding: 0, margin: 0 }}
              />
              <View style={styles.titleAndBadgeContainer}>
                {isEditing ? (
                  <TextInput
                    style={[styles.title, styles.titleInput]}
                    value={editedTitle}
                    onSubmitEditing={onSubmit}
                    onChangeText={(text) => setEditedTitle(text)}
                    autoFocus={true}
                    inputMode="text"
                    lineBreakStrategyIOS="none"
                    clearButtonMode="while-editing"
                    enablesReturnKeyAutomatically={true}
                    keyboardAppearance="light"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                ) : (
                  <Text style={styles.title}>{title}</Text>
                )}
                <Badge count={unpurchasedItemsCount} size="small" />
              </View>
              <View style={styles.buttonContainer}>
                <CategoryContextMenu
                  onRename={onRenameCategory}
                  onDelete={onDeleteCategory}
                />
                {/* Temporarily hidden drag button - will be swapped with context menu during reorder mode */}
                {/* <MaterialIcons.Button
                  name="drag-indicator"
                  size={iconSize.rowIconSize}
                  color={colors.white}
                  backgroundColor={colors.lightBrandColor}
                  onLongPress={drag}
                  iconStyle={{marginRight: 5}}
                  style={iconStyle}
                  underlayColor={colors.lightBrandColor}
                /> */}
              </View>
            </View>
          </Pressable>
          {children}
        </View>
    </ScaleDecorator>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.detailsBackground,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBrandColor,
    paddingLeft: 20,
    paddingVertical: 7
  },
  titleAndBadgeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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