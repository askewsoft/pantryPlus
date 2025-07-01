import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';

import AddButton from './Buttons/AddButton';
import RemoveButton from './Buttons/RemoveButton';
import ItemInput from './ItemInput';

const CategoryFolder = ({categoryId, title, drag, children, scrollViewRef}: {categoryId: string, title: string, drag: FnReturnVoid, children: React.ReactNode, scrollViewRef?: React.RefObject<any>}) => {
  const open = uiStore.openCategories.get(categoryId)?.open ?? false;
  const currList = domainStore.lists.find(l => l.categories.find(c => c.id === categoryId));
  const currCategory = currList?.categories.find(c => c.id === categoryId);
  const xAuthUser = domainStore.user?.email!;
  const categoryRef = useRef<View>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [wasAddingItem, setWasAddingItem] = useState(false);

  const onSubmit = async () => {
    if (editedTitle.trim().toLowerCase() !== currCategory?.name.trim().toLowerCase()) {
      const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
      await currCategory?.setName(editedTitle, xAuthUser, xAuthLocation);
    }
    setIsEditing(false);
  }

  const onPressAddProduct = () => {
    uiStore.setOpenCategory(categoryId, true);
    uiStore.setAddItemToListID('');
    const willShowInput = uiStore.addItemToCategoryID !== categoryId;
    uiStore.addItemToCategoryID !== categoryId ? uiStore.setAddItemToCategoryID(categoryId) : uiStore.setAddItemToCategoryID('');
    
    // Scroll to this category when input becomes visible
    if (willShowInput && scrollViewRef?.current && categoryRef.current) {
      setTimeout(() => {
        categoryRef.current?.measureLayout(
          scrollViewRef.current,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ y: y + 100, animated: true });
          },
          () => {} // error callback
        );
      }, 300); // Small delay to ensure the input is rendered
    }
  }

  const onRemoveCategory = (categoryId: string) => {
    return () => {
      const xAuthUser = domainStore.user?.email!;
      currList?.removeCategory({ categoryId, xAuthUser });
    }
  }

  const prepareToEditName = () => {
    setEditedTitle(currCategory!.name!);
    setIsEditing(true);
  }

  // Watch for when an item is added to this category
  useEffect(() => {
    // If we were adding an item and now we're not, an item was just submitted
    if (wasAddingItem && uiStore.addItemToCategoryID !== categoryId) {
      // Scroll to show the newly added item after keyboard dismisses
      setTimeout(() => {
        if (scrollViewRef?.current && categoryRef.current) {
          categoryRef.current.measureLayout(
            scrollViewRef.current,
            (x: number, y: number) => {
              // Scroll to show the bottom of this category + some padding
              scrollViewRef.current?.scrollTo({ 
                y: y + 200, // Adjust this value based on your category height
                animated: true 
              });
            },
            () => {} // error callback
          );
        }
      }, 500); // Wait for keyboard to dismiss
    }
    
    // Track if we're currently adding an item to this category
    setWasAddingItem(uiStore.addItemToCategoryID === categoryId);
  }, [uiStore.addItemToCategoryID, categoryId, scrollViewRef, wasAddingItem]);

  const toggleFolderOpenClose = () => {
    /* We only ever want one input box for adding an item.
       If we're closing the folder and we're adding an item to this category,
       then clear the addItemToCategoryID
    */
    if (open && uiStore.addItemToCategoryID === categoryId) {
      uiStore.setAddItemToCategoryID('');
    }
    uiStore.setOpenCategory(categoryId, !open);
  }

  return (
    <ScaleDecorator activeScale={1.04}>
      <SwipeableItem
        key={categoryId}
        item={currCategory!}
        overSwipe={20}
        snapPointsLeft={[70]}
        renderUnderlayLeft={() => (
          <RemoveButton onPress={onRemoveCategory(categoryId)} />
        )}
      >
        <View ref={categoryRef} style={styles.container}>
          <Pressable
            onPress={toggleFolderOpenClose}
            onLongPress={prepareToEditName}
          >
            <View style={styles.titleContainer}>
              <AntDesign
                name={open ? "folderopen" : "folder1"}
                size={iconSize.rowIconSize}
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
              {/* TODO: encapsulate drag-indicator in a custom button */}
              <View style={styles.buttonContainer}>
                <AddButton onPress={onPressAddProduct} foreground={colors.white} background={colors.lightBrandColor} materialIconName="add-circle" />
                <MaterialIcons.Button
                  name="drag-indicator"
                  size={iconSize.rowIconSize}
                  color={colors.white}
                  backgroundColor={colors.lightBrandColor}
                  onLongPress={drag}
                  iconStyle={iconStyleStyle}
                  style={iconStyle}
                  underlayColor={colors.lightBrandColor}
                />
              </View>
            </View>
          </Pressable>
          {uiStore.addItemToCategoryID === categoryId && <ItemInput listId={currList!.id} categoryId={categoryId} />}
          {children}
        </View>
      </SwipeableItem>
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
    paddingVertical: 7,
    borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderColor: colors.brandColor,
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