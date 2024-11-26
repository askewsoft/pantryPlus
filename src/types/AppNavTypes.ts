import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AppTabParamList = {
  Lists: undefined;
  Groups: undefined;
  Locations: undefined;
  Settings: undefined;
};

export type BottomTabPropsLists = BottomTabScreenProps<AppTabParamList, 'Lists'>;
export type BottomTabPropsGroups = BottomTabScreenProps<AppTabParamList, 'Groups'>;
export type BottomTabPropsLocations = BottomTabScreenProps<AppTabParamList, 'Locations'>;
export type BottomTabPropsSettings = BottomTabScreenProps<AppTabParamList, 'Settings'>;
