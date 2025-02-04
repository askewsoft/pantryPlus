import { View, Text, Switch } from 'react-native';
import { observer } from 'mobx-react-lite';
import * as Location from 'expo-location';

import { domainStore } from '@/stores/DomainStore';
import { styles as sharedStyles } from './styles';
import colors from '@/consts/colors';
import InfoButton from '@/components/Buttons/InfoButton';

const onLocationEnabledChange = async (value: boolean): Promise<void> => {
  if (value) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
  }
  domainStore.user?.setLocationEnabled(value);
};

const Permissions = () => {
  const { user } = domainStore;
  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.propertyContainer}>
        <InfoButton />
        <Text style={sharedStyles.label}>Location</Text>
        <Switch
          thumbColor={colors.white}
          trackColor={{ true: colors.lightBrandColor, false: colors.inactiveButtonColor }}
          ios_backgroundColor={user?.locationEnabled ? colors.lightBrandColor : colors.detailsBackground}
          style={sharedStyles.switch}
          value={user?.locationEnabled}
          onValueChange={onLocationEnabledChange}
        />
      </View>
    </View>
  );
}

export default observer(Permissions);