import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { BottomTabPropsGroups } from '@/types/NavigationTypes';

const GroupsNavigation = ({route, navigation}: BottomTabPropsGroups) => {
  return (
    <View><Text>Groups</Text></View>
  );
}

export default observer(GroupsNavigation);