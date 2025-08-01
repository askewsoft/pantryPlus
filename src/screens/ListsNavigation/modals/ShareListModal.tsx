import { useState, useEffect } from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

import { uiStore } from '@/stores/UIStore';
import { domainStore, ListType } from '@/stores/DomainStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const ShareListModal = ({ navigation }: { navigation: any }) => {
  const xAuthUser = domainStore.user?.email ?? '';
  const placeholder = 'Select a Group';
  
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<ItemType<string>[]>([]);
  const [currListName, setCurrListName] = useState<string>('');

  useEffect(() => {
    if (uiStore.selectedShoppingList) {
      const selectedList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
      setCurrListName(selectedList?.name || '');
    }
  }, [uiStore.selectedShoppingList, domainStore.lists]);

  useEffect(() => {
    const groupsAssociatedWithUser = domainStore.groups.map(group => ({ 
      label: group.name, 
      value: group.id 
    }));
    setItems(groupsAssociatedWithUser);

    if (uiStore.selectedShoppingList) {
      const selectedList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
      const groupToWhomListIsShared = groupsAssociatedWithUser.find(group => group.value === selectedList?.groupId);
      if (groupToWhomListIsShared?.value) {
        setValue(groupToWhomListIsShared.value);
      } else {
        setValue(null);
      }
    }
  }, [domainStore.groups, uiStore.selectedShoppingList]);

  const onCancel = () => {
    uiStore.setSelectedShoppingList(null);
    uiStore.setShareModalVisible(false);
  }

  const onUnshare = () => {
    const listToUnshare = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
    if (listToUnshare) {
      listToUnshare.updateList({ name: listToUnshare.name, groupId: '', xAuthUser });
    }
    setValue(null);
    uiStore.setSelectedShoppingList(null);
    uiStore.setShareModalVisible(false);
  }

  const onSelectItem = async (item: ItemType<string> | undefined) => {
    const listToShare = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
    if (listToShare && item && item.value) {
      listToShare.updateList({ name: listToShare.name, groupId: item.value, xAuthUser });
    }
    uiStore.setSelectedShoppingList(null);
    uiStore.setShareModalVisible(false);
  }

  const onCreateNewGroup = () => {
    // Track that user is creating a group from the Lists screen
    uiStore.setGroupCreationOrigin('Lists');
    // do not reset the selected shopping list, so that the new group modal can redirect to the shopping list screen
    uiStore.setShareModalVisible(false);
    uiStore.setAddGroupModalVisible(true);
    navigation.navigate('Groups', { screen: 'MyGroups' });
  }

  return (
    <Modal
      visible={uiStore.shareModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Share List</Text>
        <Text style={styles.modalSubtitle}>{currListName}</Text>
        {items.length > 0 &&
          <DropDownPicker
              items={items}
              value={value}
              open={open}
              setItems={setItems}
              setValue={setValue}
              onSelectItem={onSelectItem}
              setOpen={setOpen}
              multiple={false}
              containerStyle={styles.pickerContainer}
              labelStyle={styles.input}
              placeholder={placeholder}
              placeholderStyle={styles.placeholderStyle}
              listItemLabelStyle={styles.listItemLabelStyle}
          />
        }
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            color={colors.white}
          />
          <Button
            title="Unshare"
            onPress={onUnshare}
            color={colors.white}
            disabled={!value}
          />
        </View>
        <View style={styles.createGroupContainer}>
          <Text style={styles.createGroupText}>Need to create a new group?</Text>
          <Button
            title="Create Group"
            onPress={onCreateNewGroup}
            color={colors.white}
          />
        </View>
      
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    paddingVertical: 50,
    marginTop: '60%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  modalTitle: {
    fontSize: fonts.modalTitleSize,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 60,
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.white,
  },
  pickerContainer: {
    width: '80%',
  },
  input: {
    fontSize: fonts.rowTextSize,
  },
  placeholderStyle: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  },
  listItemLabelStyle: {
    color: colors.brandColor,
    fontSize: fonts.rowTextSize,
  },
  createGroupContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginTop: 50,
  },
  createGroupText: {
    color: colors.white,
    fontSize: fonts.rowTextSize - 2,
  }
});

export default observer(ShareListModal);  