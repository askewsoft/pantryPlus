import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import SwipeableItem from "react-native-swipeable-item";
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

import { domainStore } from '@/stores/DomainStore';

import AddButton from './Buttons/AddButton';
import RemoveGroupButton from './Buttons/RemoveGroupButton';

import logging from '@/config/logging';

const Group = ({groupId, title, userIsGroupOwner, children}: {groupId: string, title: string, userIsGroupOwner: boolean, children: React.ReactNode}) => {
  const currGroup = domainStore.groups.find(g => g.id === groupId);
  const xAuthUser = domainStore.user?.email!;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddingShopper, setIsAddingShopper] = useState(false);
  const [newShopperEmail, setNewShopperEmail] = useState('');

  const onChangeShopperEmail = (text: string) => {
    setNewShopperEmail(text.toLowerCase().trim());
  }

  const onSubmit = async () => {
    if (editedTitle.trim().toLowerCase() !== title.trim().toLowerCase()) {
      await currGroup?.setName({ name: editedTitle, xAuthUser });
    }
    setIsEditing(false);
  }

  const prepareToEditName = () => {
    if (userIsGroupOwner) {
      setEditedTitle(title);
      setIsEditing(true);
    }
  }

  const onAddShopper = async () => {
    if (newShopperEmail.trim().length > 0) {
      await currGroup?.addShopperByEmail({ inviteeEmail: newShopperEmail.trim().toLowerCase(), user: domainStore.user! });
    }
    setIsAddingShopper(false);
    setNewShopperEmail('');
  }

  return (
    <SwipeableItem
      key={groupId}
      item={currGroup!}
      overSwipe={20}
      snapPointsLeft={[70]}
      renderUnderlayLeft={() => (
        <RemoveGroupButton groupId={groupId} />
      )}
      swipeEnabled={userIsGroupOwner}
    >
      <View style={styles.container}>
        <Pressable
          onLongPress={prepareToEditName}
          disabled={!userIsGroupOwner}
        >
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="group"
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
          {userIsGroupOwner && (
            <AddButton onPress={() => setIsAddingShopper(true)} foreground={colors.white} background={colors.lightBrandColor} materialIconName="person-add-alt" />
          )}
          </View>
        </Pressable>
        {isAddingShopper && userIsGroupOwner && (
          <TextInput
            style={styles.memberInput}
            value={newShopperEmail}
            onSubmitEditing={onAddShopper}
            onChangeText={onChangeShopperEmail}
            autoFocus={true}
          />
        )}
        {children}
      </View>
    </SwipeableItem>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.itemBackground,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBrandColor,
    marginTop: 2,
    paddingLeft: 20,
    paddingVertical: 7,
    minHeight: fonts.rowIconSize + 24,
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
  memberInput: {
    fontSize: fonts.rowTextSize,
    backgroundColor: colors.detailsBackground,
    color: colors.lightBrandColor,
    marginLeft: 40,
    padding: 7,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
  }
});

export default observer(Group);