import { StackScreenProps } from '@react-navigation/stack';

export const ListsStack = [
  'MyLists',
  'ShoppingList',
  'PurchaseHistory',
] as const;

export type ListsStackParamList = {
  [key in typeof ListsStack[number]]: undefined;
};

export type StackPropsListsMyLists = StackScreenProps<ListsStackParamList, 'MyLists'>;
export type StackPropsShoppingList = StackScreenProps<ListsStackParamList, 'ShoppingList'>;
export type StackPropsPurchaseHistory = StackScreenProps<ListsStackParamList, 'PurchaseHistory'>;