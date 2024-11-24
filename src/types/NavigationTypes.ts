import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

export type RootTabParamList = {
  MyLists: undefined;
  Groups: undefined;
  Locations: undefined;
  Settings: undefined;
};

export type ListsStackParamList = {
  MyLists: undefined;
  ShoppingList: { listId: string };
  PurchaseHistory: { listId: string };
};

export type GroupsStackParamList = {
  Groups: undefined;
  GroupDetails: { groupId: string };
};

export type LocationsStackParamList = {
  Locations: undefined;
  LocationDetails: { locationId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  Permissions: undefined;
};

export type BottomTabPropsMyLists = BottomTabScreenProps<RootTabParamList, 'MyLists'>;
export type BottomTabPropsGroups = BottomTabScreenProps<RootTabParamList, 'Groups'>;
export type BottomTabPropsLocations = BottomTabScreenProps<RootTabParamList, 'Locations'>;
export type BottomTabPropsSettings = BottomTabScreenProps<RootTabParamList, 'Settings'>;

export type StackPropsMyLists = StackScreenProps<ListsStackParamList>;
export type StackPropsMyList = StackScreenProps<ListsStackParamList, 'MyList'>;
export type StackPropsShoppingList = StackScreenProps<ListsStackParamList, 'ShoppingList'>;
export type StackPropsPurchaseHistory = StackScreenProps<ListsStackParamList, 'PurchaseHistory'>;

export type StackPropsGroups = StackScreenProps<GroupsStackParamList>;
export type StackPropsGroupDetails = StackScreenProps<GroupsStackParamList, 'GroupDetails'>;

export type StackPropsLocations = StackScreenProps<LocationsStackParamList>;
export type StackPropsLocationDetails = StackScreenProps<LocationsStackParamList, 'LocationDetails'>;

export type StackPropsSettings = StackScreenProps<SettingsStackParamList>;
export type StackPropsProfile = StackScreenProps<SettingsStackParamList, 'Profile'>;
export type StackPropsPermissions = StackScreenProps<SettingsStackParamList, 'Permissions'>;
