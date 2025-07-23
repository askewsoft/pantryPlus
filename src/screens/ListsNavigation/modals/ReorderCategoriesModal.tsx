import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { DragEndParams } from 'react-native-draggable-flatlist';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import { CategoryType } from '@/stores/models/List';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';
import { sortByOrdinal } from '@/stores/utils/sorter';

const ReorderCategoriesModal = () => {
  const currentList = domainStore.lists.find(list => list.id === uiStore.selectedShoppingList);
  const xAuthUser = domainStore.user?.email;

  const onClose = () => {
    uiStore.setReorderCategoriesModalVisible(false);
  };

  const onSave = () => {
    uiStore.setReorderCategoriesModalVisible(false);
  };

  const renderCategoryItem = ({ item: category, drag }: { item: CategoryType, drag: FnReturnVoid }) => {
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onLongPress={drag}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="drag-indicator"
          size={iconSize.rowIconSize}
          color={colors.lightBrandColor}
          style={styles.dragIcon}
        />
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  const onDragEnd = ({ data }: DragEndParams<CategoryType>) => {
    if (!currentList || !xAuthUser) return;

    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    // Location check is now handled upfront, but keep as safety check
    if (xAuthLocation === '') {
      console.error('Location not set during drag end - this should not happen');
      return;
    }

    // Update the ordinals in sequence to avoid race conditions
    const updateOrdinals = async () => {
      try {
        for (let i = 0; i < data.length; i++) {
          const category = data[i];
          if (category.ordinal !== i) {
            const updatedCategory = currentList.categories.find(c => c.id === category.id);
            if (updatedCategory) {
              await updatedCategory.setOrdinal(i, xAuthUser, xAuthLocation);
            }
          }
        }
      } catch (error) {
        console.error('Error updating category order:', error);
        Alert.alert('Error', 'Failed to update category order. Please try again.');
      }
    };

    updateOrdinals();
  };

  if (!currentList) return null;

  return (
    <Modal
      visible={uiStore.reorderCategoriesModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Reorder Categories</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <DraggableFlatList
            data={toJS(currentList.categories).sort(sortByOrdinal)}
            renderItem={renderCategoryItem}
            keyExtractor={category => category.id}
            onDragEnd={onDragEnd}
            style={styles.list}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No categories found</Text>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    paddingVertical: 20,
    marginTop: '10%',
  },
  modalContent: {
    flex: 1,
    width: '90%',
    flexDirection: 'column',
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    padding: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  list: {
    height: '80%',
    backgroundColor: colors.brandColor,
    borderRadius: 8,
    padding: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.detailsBackground,
    padding: 12,
    marginVertical: 2,
    borderRadius: 6,
  },
  dragIcon: {
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    color: colors.brandColor,
  },


  cancelButton: {
    flex: 1,
    backgroundColor: colors.inactiveButtonColor,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.lightBrandColor,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
  },
  emptyText: {
    color: colors.white,
    fontSize: fonts.rowTextSize,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default observer(ReorderCategoriesModal); 