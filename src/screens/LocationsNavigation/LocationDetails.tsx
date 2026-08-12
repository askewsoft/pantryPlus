import { View, Text, StyleSheet, Pressable, Linking, Alert, Platform } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ErrorBoundary from '@/components/ErrorBoundary';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

import InfoButton from '@/components/Buttons/InfoButton';
import { Tooltip } from '@/consts/Tooltip';
import { formatAsDate } from '@/stores/utils/dateFormatter';

const LocationDetails = () => {
  const location = domainStore.locations.find(location => location.id === uiStore.selectedLocation)
    ?? (domainStore.nearestKnownLocation?.id === uiStore.selectedLocation
      ? domainStore.nearestKnownLocation
      : undefined);

  const openInMaps = async () => {
    if (location?.latitude == null || location?.longitude == null) {
      Alert.alert('Location unavailable', 'This location has no coordinates to show on a map.');
      return;
    }
    const { latitude, longitude, name } = location;
    const label = encodeURIComponent(name);
    const appleMapsUrl = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`;
    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    const url = Platform.OS === 'ios' ? appleMapsUrl : geoUrl;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen && Platform.OS === 'android') {
        await Linking.openURL(appleMapsUrl);
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.error(`Failed to open maps: ${error}`);
      Alert.alert('Could not open Maps', 'Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.propertyContainer}>
          <InfoButton tooltipId={Tooltip.locationName} />
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {location?.name}
          </Text>
        </View>
        <View style={styles.propertyContainer}>
          <InfoButton tooltipId={Tooltip.latitude} />
          <Text style={styles.label}>Lat / Long</Text>
          <Pressable style={styles.value} onPress={openInMaps}>
            <Text style={[styles.valueText, styles.mapLink]} numberOfLines={1} ellipsizeMode="tail">
              {location?.latitude?.toFixed(5)} / {location?.longitude?.toFixed(5)}
            </Text>
          </Pressable>
        </View>
        <View style={styles.propertyContainer}>
          <InfoButton tooltipId={Tooltip.lastPurchaseDate} />
          <Text style={styles.label}>Last Bought</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {location?.lastPurchaseDate ? formatAsDate(location.lastPurchaseDate) : '—'}
          </Text>
        </View>
      </View>
    </ErrorBoundary>
  );
};

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
    marginLeft: 30,
    marginRight: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.inactiveButtonColor,
    borderRadius: 5,
  },
  valueText: {
    fontSize: fonts.badgeTextSize,
    color: colors.brandColor,
  },
  mapLink: {
    textDecorationLine: 'underline',
  },
});

export default observer(LocationDetails);
