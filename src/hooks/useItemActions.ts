import { useCallback } from 'react';
import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

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
      currCategory?.removeItem({
        itemId,
        xAuthUser,
        onItemRemoved: () => currList?.loadUnpurchasedItemsCount({ xAuthUser })
      });
    }
    await currList?.removeItem({ itemId, xAuthUser });
  }, [categoryId, currCategory, currList, itemId, xAuthUser]);

  const onUncategorizeItem = useCallback(async () => {
    if (categoryId) {
      await currCategory?.unCategorizeItem({
        itemId,
        xAuthUser,
        onItemRemoved: () => currList?.loadUnpurchasedItemsCount({ xAuthUser })
      });
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
      // Mark item as recently removed to prevent it from reappearing during sync
      // This prevents race conditions where a sync request returns before purchase completes
      uiStore.markItemAsRecentlyRemoved(itemId);
      try {
        await currList.purchaseItem({ itemId, xAuthUser, xAuthLocation });
        await onRemoveItem();
      } catch (error) {
        // If purchase fails, clear the mark so the item can be re-added if needed
        // This ensures the item will reappear if the purchase didn't actually complete
        uiStore.clearRecentlyRemovedMark(itemId);
        throw error; // Re-throw to allow caller to handle the error
      }
    }
  }, [itemId, setIsChecked, onRemoveItem, currList, xAuthUser]);

  // handleCheck function removed - now using setIsChecked and handlePurchase directly

  return {
    setIsChecked,
    handlePurchase,
    onRemoveItem,
    onUncategorizeItem: categoryId ? onUncategorizeItem : undefined,
  };
};