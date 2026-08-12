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
import LocationContextMenu from './ContextMenus/LocationContextMenu';

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
    const trimmed = editedTitle.trim();
    if (trimmed.length === 0) {
      setEditedTitle(location!.name);
      setIsEditing(false);
      return;
    }
    if (trimmed.toLowerCase() !== location!.name.trim().toLowerCase()) {
      try {
        await domainStore.updateLocationName({ locationId: location!.id, name: trimmed });
      } catch (error) {
        console.error(`Failed to update location name: ${error}`);
        Alert.alert('Could not rename location', 'Please try again.');
        setEditedTitle(location!.name);
      }
    }
    setIsEditing(false);
  };

  const onRenameLocation = () => {
    setEditedTitle(location?.name ?? '');
    setIsEditing(true);
  };

  const handlePress = ({ id }: { id: string }) => {
    if (isEditing) return;
    uiStore.setSelectedLocation(id);
    navigation.navigate('LocationDetails');
  };

  const onSelectLocation = () => {
    // If this location is already selected, deselect it (set to null)
    // Otherwise, select this location and stop GPS from overwriting the pick
    const newSelectedId = domainStore.selectedKnownLocationId === id ? null : id;
    domainStore.selectKnownLocation(newSelectedId);
    if (returnToList && newSelectedId) {
      navigation.navigate('Lists', { screen: 'ShoppingList' });
    }
  };

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
      <Pressable
        style={styles.titleContainer}
        onPress={() => handlePress({ id })}
        disabled={isEditing}
      >
        <MaterialIcons name="store" size={iconSize.rowIconSize} color={colors.lightBrandColor} />
        <View style={styles.locationDetails}>
          {isEditing ? (
            <TextInput
              style={[styles.title, styles.titleInput]}
              value={editedTitle}
              onSubmitEditing={onSubmit}
              onChangeText={setEditedTitle}
              autoFocus={true}
              inputMode="text"
              lineBreakStrategyIOS="none"
              clearButtonMode="while-editing"
              enablesReturnKeyAutomatically={true}
              keyboardAppearance="light"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          ) : (
            <Text style={styles.title}>{location?.name ?? ''}</Text>
          )}
          <Text style={styles.lastPurchaseDate}>
            {location?.lastPurchaseDate
              ? `most recent: ${formatAsDate(location.lastPurchaseDate)}`
              : 'no purchases yet'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.buttonContainer}>
        <LocationContextMenu onRename={onRenameLocation} />
        <Pressable
          style={styles.selectLocationButton}
          onPress={onSelectLocation}
          accessibilityLabel={isCurrentLocation ? 'Deselect location' : 'Select location'}
          accessibilityRole="button"
        >
          <MaterialIcons name={iconName} size={iconSize.rowIconSize} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationElement: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.itemBackground,
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
    marginTop: 5,
  },
  titleContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
  },
  locationDetails: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectLocationButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
    marginLeft: 10,
  },
  titleInput: {
    backgroundColor: colors.brandColor,
    color: colors.white,
    paddingRight: 5,
    borderRadius: 4,
  },
  lastPurchaseDate: {
    fontSize: fonts.badgeTextSize,
    fontStyle: 'italic',
    color: colors.lightBrandColor,
    marginLeft: 10,
  },
});

export default observer(LocationElement);
