import { StackScreenProps } from '@react-navigation/stack';

export type ListsStackParamList = {
  MyLists: undefined;
  ShoppingList: { id: string, name: string };
  PurchaseHistory: { id: string, name: string };
};

export type StackPropsListsMyLists = StackScreenProps<ListsStackParamList, 'MyLists'>;
export type StackPropsShoppingList = StackScreenProps<ListsStackParamList, 'ShoppingList'>;
export type StackPropsPurchaseHistory = StackScreenProps<ListsStackParamList, 'PurchaseHistory'>;