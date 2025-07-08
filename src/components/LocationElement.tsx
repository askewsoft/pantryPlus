import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';
import { formatAsDate } from '@/stores/utils/dateFormatter';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const LocationElement = ({id, navigation, returnToList}: {id: string, navigation: any, returnToList: boolean}) => {
  let location: any;
  // ugly, but it works and is easier than trying to make MST and TypeScript play nicely
  if (domainStore.nearestKnownLocation?.id === id) {
    location = domainStore.nearestKnownLocation;
  } else {
    location = domainStore.locations.find(location => location.id === id);
  }

  // Don't render if no valid location is found
  if (!location) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(location?.name ?? '');
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [iconName, setIconName] = useState<MaterialIconName>('location-off');
  const [iconColor, setIconColor] = useState(colors.brandColor);

  const onSubmit = async () => {
    const { id: locationId } = location!;
    const xAuthUser = domainStore.user!.email;
    if (editedTitle.trim().toLowerCase() !== location!.name.trim().toLowerCase()) {
      // TODO: enable updates to the location name, etc
      // await location?.updateLocation({ name: editedTitle, locationId, xAuthUser });
      Alert.alert('editedTitle', editedTitle);
    }
    setIsEditing(false)
  }

  const prepareToEditName = () => {
    setEditedTitle(location?.name ?? '');
    setIsEditing(true);
  }

  const handlePress = ({ id }: { id: string }) => {
    uiStore.setSelectedLocation(id);
    navigation.navigate('LocationDetails');
  }

  const onSelectLocation = () => {
    // If this location is already selected, deselect it (set to null)
    // Otherwise, select this location
    const newSelectedId = domainStore.selectedKnownLocationId === id ? null : id;
    domainStore.setSelectedKnownLocationId(newSelectedId);
    if (returnToList && newSelectedId) {
      navigation.navigate('Lists', { screen: 'ShoppingList' });
    }
  }

  useEffect(() => {
    if (id === domainStore.selectedKnownLocationId) {
      setIsCurrentLocation(true);
      setIconName('location-on');
      setIconColor(colors.lightBrandColor);
    } else {
      setIsCurrentLocation(false);
      setIconName('location-off');
      setIconColor(colors.disabledButtonColor);
    }
  }, [id, domainStore.selectedKnownLocationId, isCurrentLocation]);

  return (
    <View style={styles.locationElement}>
      <Pressable style={styles.titleContainer}
        onPress={() => handlePress({ id })}
        onLongPress={prepareToEditName}
      >
        <MaterialIcons name="store" size={iconSize.rowIconSize} color={colors.lightBrandColor} />
        <View style={styles.locationDetails}>
          <Text style={styles.title}>{location?.name ?? ''}</Text>
          <Text style={styles.lastPurchaseDate}>most recent: {formatAsDate(location?.lastPurchaseDate!)}</Text>
        </View>
        <MaterialIcons.Button name={iconName} size={iconSize.rowIconSize} color={iconColor} style={styles.iconRight} onPress={onSelectLocation}/>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  locationElement: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.itemBackground,
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
    marginTop: 5,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  locationDetails: {
    flex: 1,
  },
  iconRight: {
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: colors.itemBackground,
    borderRadius: 0,
  },
  title: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
    marginLeft: 10,
  },
  lastPurchaseDate: {
    fontSize: fonts.badgeTextSize,
    fontStyle: 'italic',
    color: colors.lightBrandColor,
    marginLeft: 10,
  },
});

export default observer(LocationElement);