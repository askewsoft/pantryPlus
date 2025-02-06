import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

import InfoButton from '@/components/Buttons/InfoButton';

const LocationDetails = () => {
  const location = domainStore.locations.find(location => location.id === uiStore.selectedLocation);
  return (
    <View style={styles.container}>
      <View style={styles.propertyContainer}>
        <InfoButton />
        <Text style={styles.label}>Name</Text>
        {/* TODO: implement edit toggle to TextInput */}
        <Text style={styles.value} numberOfLines={1} ellipsizeMode='tail'>{location?.name}</Text>
      </View>
      <View style={styles.propertyContainer}>
        <InfoButton />
        <Text style={styles.label}>Lat / Long</Text>
        {/* TODO: implement edit toggle to Modal for picking map location? */}
        <Text style={styles.value} numberOfLines={1} ellipsizeMode='tail'>
          {location?.latitude?.toFixed(5)} / {location?.longitude?.toFixed(5)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 20,
    marginHorizontal: 10,
  },
  propertyContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
    marginHorizontal: 5,
  },
  label: {
    flex: 1,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    color: colors.brandColor,
    verticalAlign: 'middle',
  },
  value: {
    flex: 2,
    fontSize: fonts.badgeTextSize,
    color: colors.brandColor,
    backgroundColor: colors.detailsBackground,
    verticalAlign: 'middle',
    marginHorizontal: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.inactiveButtonColor,
    borderRadius: 5,
  }
});

export default observer(LocationDetails);