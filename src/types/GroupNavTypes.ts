import { StackScreenProps } from '@react-navigation/stack';

export type GroupsStackParamList = {
  MyGroups: undefined;
  MyInvites: undefined;
};

export type StackPropsMyGroups = StackScreenProps<GroupsStackParamList, 'MyGroups'>;
export type StackPropsMyInvites = StackScreenProps<GroupsStackParamList, 'MyInvites'>;
