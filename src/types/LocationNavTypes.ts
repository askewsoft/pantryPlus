import { StackScreenProps } from '@react-navigation/stack';

export const LocationsStack = [
  'MyLocations',
  'LocationDetails',
] as const;

export type LocationsStackParamList = {
  [key in typeof LocationsStack[number]]: undefined;
};

export type StackPropsMyLocations = StackScreenProps<LocationsStackParamList, 'MyLocations'>;
export type StackPropsLocationDetails = StackScreenProps<LocationsStackParamList, 'LocationDetails'>;
