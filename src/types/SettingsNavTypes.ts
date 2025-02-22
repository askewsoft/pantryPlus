import { StackScreenProps } from '@react-navigation/stack';

export const SettingsStack = [
  'MySettings',
  'Profile',
  'Permissions',
] as const;

export type SettingsStackParamList = {
  [key in typeof SettingsStack[number]]: undefined;
};

export type StackPropsMySettings = StackScreenProps<SettingsStackParamList, 'MySettings'>;
export type StackPropsProfile = StackScreenProps<SettingsStackParamList, 'Profile'>;
export type StackPropsPermissions = StackScreenProps<SettingsStackParamList, 'Permissions'>;
