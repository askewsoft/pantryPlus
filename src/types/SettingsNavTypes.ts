import { StackScreenProps } from '@react-navigation/stack';

export type SettingsStackParamList = {
  MySettings: undefined;
  Profile: undefined;
  Permissions: undefined;
};

export type StackPropsMySettings = StackScreenProps<SettingsStackParamList, 'MySettings'>;
export type StackPropsProfile = StackScreenProps<SettingsStackParamList, 'Profile'>;
export type StackPropsPermissions = StackScreenProps<SettingsStackParamList, 'Permissions'>;
