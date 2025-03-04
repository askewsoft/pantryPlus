import { useCallback } from 'react';
import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

type UseItemActionsProps = {
  listId: string;
  categoryId?: string;
  itemId: string;
};

export const useItemActions = ({
  listId,
  categoryId,
  itemId,
}: UseItemActionsProps) => {
  const xAuthUser = domainStore.user?.email!;
  const currList = domainStore.lists.find((list) => list.id === listId);
  const currCategory = categoryId ? currList?.categories.find((category) => category.id === categoryId) : undefined;

  const setIsChecked = useCallback((isChecked: boolean) => {
    const item = categoryId 
      ? currCategory?.items.find((item) => item.id === itemId)
      : currList?.items.find((item) => item.id === itemId);
    
    if (item) {
      item.setIsChecked(isChecked);
    }
  }, [categoryId, currCategory, currList, itemId]);

  const onRemoveItem = useCallback(async () => {
    if (categoryId) {
      currCategory?.removeItem({ itemId });
    }
    await currList?.removeItem({ itemId, xAuthUser });
  }, [categoryId, currCategory, currList, itemId, xAuthUser]);

  const onUncategorizeItem = useCallback(async () => {
    if (categoryId) {
      await currCategory?.unCategorizeItem({ itemId, xAuthUser });
      await currList?.removeItem({ itemId, xAuthUser });
    }
  }, [categoryId, currCategory, currList, itemId, xAuthUser]);

  const handlePurchase = useCallback(async () => {
    const xAuthLocation = domainStore.selectedKnownLocationId ?? '';
    if (xAuthLocation === '') {
      setIsChecked(false);
      uiStore.setPickLocationPromptVisible(true);
      return;
    } else {
      uiStore.setRecentLocationsNeedRefresh(true);
    }
    if (currList) {
      await currList.purchaseItem({ itemId, xAuthUser, xAuthLocation });
      await onRemoveItem();
    }
  }, [itemId, setIsChecked, onRemoveItem, currList, xAuthUser]);

  const handleCheck = useCallback((isChecked: boolean) => {
    setIsChecked(isChecked);
    if (isChecked) {
      handlePurchase();
    }
  }, [setIsChecked, handlePurchase]);

  return {
    handleCheck,
    onRemoveItem,
    onUncategorizeItem: categoryId ? onUncategorizeItem : undefined,
  };
}; 