import { StackScreenProps } from '@react-navigation/stack';

export const GroupsStack = [
  'MyGroups',
  'MyInvites',
] as const;

export type GroupsStackParamList = {
  [key in typeof GroupsStack[number]]: undefined;
};

export type StackPropsMyGroups = StackScreenProps<GroupsStackParamList, 'MyGroups'>;
export type StackPropsMyInvites = StackScreenProps<GroupsStackParamList, 'MyInvites'>;
