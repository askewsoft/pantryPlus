import { StackScreenProps } from '@react-navigation/stack';

export type GroupsStackParamList = {
  MyGroups: undefined;
  GroupDetails: { groupId: string };
};

export type StackPropsMyGroups = StackScreenProps<GroupsStackParamList, 'MyGroups'>;
export type StackPropsGroupDetails = StackScreenProps<GroupsStackParamList, 'GroupDetails'>;