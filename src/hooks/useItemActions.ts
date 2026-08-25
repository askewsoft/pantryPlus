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
    // Membership-only API delete; local detach from every category on this list.
    // Category catalog links stay on the server for auto-assign on re-add.
    await currList?.removeItem({ itemId, xAuthUser });
  }, [currList, itemId, xAuthUser]);

  const onUncategorizeItem = useCallback(async () => {
    // Clear all same-list category links; keep list membership (uncategorized).
    await currList?.clearItemCategories({ itemId, xAuthUser });
    await currList?.loadUnpurchasedItemsCount({ xAuthUser });
  }, [currList, itemId, xAuthUser]);

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