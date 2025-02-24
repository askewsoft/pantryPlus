import { useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

const ListElement = ({id, drag, navigation}: {id: string, drag: () => void, navigation: any}) => {
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

  const handlePress = () => {
    uiStore.setSelectedShoppingList(id);
    navigation.navigate('ShoppingList');
  }

  const openShareModal = () => {
    uiStore.setSelectedShoppingList(id);
    uiStore.setShareModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.titleContainer}
        onPress={handlePress}
        onLongPress={prepareToEditName}
      >
        <MaterialIcons name="format-list-bulleted" size={fonts.rowIconSize} color={colors.brandColor} />
        {isEditing ? (
          <TextInput
            style={[styles.title, styles.titleInput]}
            value={editedTitle}
            onSubmitEditing={onSubmit}
            onChangeText={(text: string) => setEditedTitle(text)}
            autoFocus={true}
          />
        ) : (
          <Text style={styles.title}>{list?.name}</Text>
        )}
      </Pressable>
      <View style={styles.buttonContainer}>
        {userIsListOwner && (
          <MaterialIcons.Button
            name="ios-share"
            size={fonts.rowIconSize}
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
          size={fonts.rowIconSize}
          backgroundColor={colors.itemBackground}
          color={colors.brandColor}
          iconStyle={iconStyleStyle}
          style={iconStyle}
          onLongPress={drag}
        />
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