import { useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';
import Badge from './Badge';
import ListContextMenu from './ContextMenus/ListContextMenu';

const ListElement = ({id, navigation}: {id: string, navigation: any}) => {
  const list = domainStore.lists.find(list => list.id === id);
  const userIsListOwner = list?.ownerId === domainStore.user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list!.name);

  // Calculate unpurchased items count for this list
  // Since purchased items are removed from the list, all items are unpurchased
  const unpurchasedItemsCount = list?.unpurchasedItemsCount ?? 0;

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
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => domainStore.removeList(id)
        }
      ]
    );
  }

  const onRenameList = () => {
    if (userIsListOwner) {
      setEditedTitle(list!.name);
      setIsEditing(true);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.titleContainer}
        onPress={handlePress}
        onLongPress={prepareToEditName}
        accessibilityLabel={list?.name}
        accessibilityHint="Opens the shopping list to view and manage items"
        accessibilityRole="button"
      >
        <MaterialIcons name="format-list-bulleted" size={iconSize.rowIconSize} color={colors.brandColor} />
        <View style={styles.titleAndBadgeContainer}>
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
            <Text
              style={styles.title}
              accessibilityLabel={list?.name}
              accessibilityHint="Shopping list name"
              accessibilityRole="button"
            >
              {list?.name}
            </Text>
          )}
          <Badge count={unpurchasedItemsCount} size="small" />
        </View>
      </Pressable>
      <View style={styles.buttonContainer}>
        {userIsListOwner && (
          <ListContextMenu
            onShare={openShareModal}
            onRename={onRenameList}
            onDelete={onRemoveList}
            userIsListOwner={userIsListOwner}
          />
        )}
      </View>
    </View>
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
  titleAndBadgeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
  }
});

export default observer(ListElement);