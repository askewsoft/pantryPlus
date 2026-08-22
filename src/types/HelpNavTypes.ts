import { StackScreenProps } from '@react-navigation/stack';

export const HelpStack = [
  'MyHelp',
  'SiriTips',
  'About',
] as const;

export type HelpStackParamList = {
  [key in typeof HelpStack[number]]: undefined;
};

export type StackPropsMyHelp = StackScreenProps<HelpStackParamList, 'MyHelp'>;
export type StackPropsSiriTips = StackScreenProps<HelpStackParamList, 'SiriTips'>;
export type StackPropsAbout = StackScreenProps<HelpStackParamList, 'About'>;
