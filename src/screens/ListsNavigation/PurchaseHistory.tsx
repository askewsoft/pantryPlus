import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { StackPropsPurchaseHistory } from '@/types/ListNavTypes';

const PurchaseHistory = ({route, navigation}: StackPropsPurchaseHistory) => {
  return (
    <View><Text>Purchase History</Text></View>
  );
}

export default observer(PurchaseHistory);