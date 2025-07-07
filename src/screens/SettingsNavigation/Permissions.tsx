import { View, Text, Switch } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { locationService } from '@/services/LocationService';

import { styles as sharedStyles } from './styles';
import colors from '@/consts/colors';
import InfoButton from '@/components/Buttons/InfoButton';
import { Tooltip } from '@/consts/Tooltip';

const onLocationEnabledChange = async (value: boolean) => {
  domainStore.setLocationEnabled(value);
  
  if (value) {
    // Start location tracking when enabled
    locationService.startTracking();
  } else {
    // Stop location tracking when disabled
    locationService.stopTracking();
  }
};

const Permissions = () => {
  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.propertyContainer}>
        <InfoButton tooltipId={Tooltip.location} />
        <Text style={sharedStyles.label}>Location</Text>
        <Switch
          thumbColor={colors.white}
          trackColor={{ true: colors.lightBrandColor, false: colors.inactiveButtonColor }}
          ios_backgroundColor={domainStore.locationEnabled ? colors.lightBrandColor : colors.detailsBackground}
          style={sharedStyles.switch}
          value={domainStore.locationEnabled}
          onValueChange={onLocationEnabledChange}
        />
      </View>
    </View>
  );
}

export default observer(Permissions);