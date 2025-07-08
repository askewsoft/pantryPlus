import { useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';
import RemoveButton from './Buttons/RemoveButton';

const ListElement = ({id, drag, navigation}: {id: string, drag: FnReturnVoid, navigation: any}) => {
  const list = domainStore.lists.find(list => list.id === id);
  const userIsListOwner = list?.ownerId === domainStore.user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list!.name);

  const onSubmit = async () => {
    const { groupId } = list!;
    const xAuthUser = domainStore.user!.email;
    if (editedTitle.trim().toLowerCase() !== list!.name.trim().toLowerCase()) {
      await list?.updateList({ name: editedTitle, groupId, xAuthUser });
    }
    setIsEditing(false)
  }

  const prepareToEditName = () => {
    if (userIsListOwner) {
      setEditedTitle(list!.name);
      setIsEditing(true);
    }
  }

  const handlePress = async () => {
    uiStore.setSelectedShoppingList(id);
    navigation.navigate('ShoppingList');
  }

  const openShareModal = () => {
    uiStore.setSelectedShoppingList(id);
    uiStore.setShareModalVisible(true);
  }

  const onRemoveList = () => {
    domainStore.removeList(id);
  }

  return (
    <ScaleDecorator activeScale={1.04}>
      <SwipeableItem
        key={id}
        item={list!}
        overSwipe={20}
        snapPointsLeft={[80]}
        renderUnderlayLeft={() => (
          <RemoveButton onPress={onRemoveList} />
        )}
        swipeEnabled={userIsListOwner}
      >
        <View style={styles.container}>
          <Pressable style={styles.titleContainer}
            onPress={handlePress}
            onLongPress={prepareToEditName}
          >
            <MaterialIcons name="format-list-bulleted" size={iconSize.rowIconSize} color={colors.brandColor} />
            {isEditing ? (
              <TextInput
                style={[styles.title, styles.titleInput]}
                value={editedTitle}
                onSubmitEditing={onSubmit}
                onChangeText={(text: string) => setEditedTitle(text)}
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
              <Text style={styles.title}>{list?.name}</Text>
            )}
          </Pressable>
          <View style={styles.buttonContainer}>
            {userIsListOwner && (
              <MaterialIcons.Button
                name="ios-share"
                size={iconSize.rowIconSize}
                backgroundColor={colors.itemBackground}
                color={colors.brandColor}
                iconStyle={iconStyleStyle}
                style={iconStyle}
                underlayColor={colors.lightBrandColor}
                onPress={openShareModal}
              />
            )}
            <MaterialIcons.Button
              name="drag-indicator"
              size={iconSize.rowIconSize}
              backgroundColor={colors.itemBackground}
              color={colors.brandColor}
              iconStyle={iconStyleStyle}
              style={iconStyle}
              onLongPress={drag}
            />
          </View>
        </View>
      </SwipeableItem>
    </ScaleDecorator>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBackground,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    marginTop: 5,
  },
  titleContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
  },
  title: {
    flex: 1,
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.brandColor,
    paddingVertical: 5,
    marginLeft: 10,
  },
  titleInput: {
    backgroundColor: colors.lightBrandColor,
    paddingRight: 5,
    color: colors.white,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  }
});

export default observer(ListElement);