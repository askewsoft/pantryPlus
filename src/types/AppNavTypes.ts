import { DrawerScreenProps } from '@react-navigation/drawer';

export const AppTabs = [
  'Lists',
  'Groups',
  'Locations',
  'Settings',
  'Help',
] as const;

// TypeScript type for react-navigation
export type AppTabsParamList = {
  [key in typeof AppTabs[number]]: undefined;
};

export type BottomTabPropsLists = DrawerScreenProps<AppTabsParamList, 'Lists'>;
export type BottomTabPropsGroups = DrawerScreenProps<AppTabsParamList, 'Groups'>;
export type BottomTabPropsLocations = DrawerScreenProps<AppTabsParamList, 'Locations'>;
export type BottomTabPropsSettings = DrawerScreenProps<AppTabsParamList, 'Settings'>;
export type BottomTabPropsHelp = DrawerScreenProps<AppTabsParamList, 'Help'>;
