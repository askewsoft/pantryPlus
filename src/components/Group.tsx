import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import SwipeableItem from "react-native-swipeable-item";
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

import { domainStore } from '@/stores/DomainStore';

import AddShopperButton from './Buttons/AddShopperButton';
import RemoveGroupButton from './Buttons/RemoveGroupButton';

import logging from '@/config/logging';

const Group = ({groupId, title, children}: {groupId: string, title: string, children: React.ReactNode}) => {
  const currGroup = domainStore.groups.find(g => g.id === groupId);
  const xAuthUser = domainStore.user?.email!;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddingShopper, setIsAddingShopper] = useState(false);
  const [newShopperEmail, setNewShopperEmail] = useState('');

  useEffect(() => {
    currGroup?.loadGroupMembers({ xAuthUser });
  }, [xAuthUser]);

  const onSubmit = async () => {
    if (editedTitle.trim().toLowerCase() !== title.trim().toLowerCase()) {
      await currGroup?.setName({ name: editedTitle, xAuthUser });

    }
    setIsEditing(false);
  }

  const prepareToEditName = () => {
    setEditedTitle(title);
    setIsEditing(true);
  }

  const onAddShopper = async () => {
    // TODO: Add shopper to Group by either email or id
    // currGroup?.addShopperById({ shopperId: newShopperEmail, xAuthUser });
    // currGroup?.addShopperByEmail({ shopperEmail: newShopperEmail, xAuthUser });
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
    >
      <View style={styles.container}>
        <Pressable
          onLongPress={prepareToEditName}
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
            <AddShopperButton onPress={onAddShopper} foreground={colors.white} background={colors.lightBrandColor} />
          </View>
        </Pressable>
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

export default observer(Group);