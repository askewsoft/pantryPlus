import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export const AppTabs = [
  'Lists',
  'Groups',
  'Locations',
  'Settings'
] as const;

// TypeScript type for react-navigation
export type AppTabsParamList = {
  [key in typeof AppTabs[number]]: undefined;
};

export type BottomTabPropsLists = BottomTabScreenProps<AppTabsParamList, 'Lists'>;
export type BottomTabPropsGroups = BottomTabScreenProps<AppTabsParamList, 'Groups'>;
export type BottomTabPropsLocations = BottomTabScreenProps<AppTabsParamList, 'Locations'>;
export type BottomTabPropsSettings = BottomTabScreenProps<AppTabsParamList, 'Settings'>;
