import { StackScreenProps } from '@react-navigation/stack';

export type LocationsStackParamList = {
  MyLocations: undefined;
  LocationDetails: { locationId: string };
};

export type StackPropsMyLocations = StackScreenProps<LocationsStackParamList, 'MyLocations'>;
export type StackPropsLocationDetails = StackScreenProps<LocationsStackParamList, 'LocationDetails'>;
