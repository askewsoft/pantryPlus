import { StackScreenProps } from '@react-navigation/stack';

export type GroupsStackParamList = {
  MyGroups: undefined;
};

export type StackPropsMyGroups = StackScreenProps<GroupsStackParamList, 'MyGroups'>;