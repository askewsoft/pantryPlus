import { useState } from 'react';
import { Text, View, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { formatAsDate } from '@/stores/utils/dateFormater';

const LocationElement = ({id, navigation}: {id: string, navigation: any}) => {
  const location = domainStore.locations.find(location => location.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(location!.name);

  const onSubmit = async () => {
    const { id: locationId } = location!;
    const xAuthUser = domainStore.user!.email;
    if (editedTitle.trim().toLowerCase() !== location!.name.trim().toLowerCase()) {
      // await location?.updateLocation({ name: editedTitle, locationId, xAuthUser });
      Alert.alert('editedTitle', editedTitle);
    }
    setIsEditing(false)
  }

  const prepareToEditName = () => {
    setEditedTitle(location!.name);
    setIsEditing(true);
  }

  const handlePress = ({ id }: { id: string }) => {
    uiStore.setSelectedLocation(id);
    navigation.navigate('LocationDetails');
  }

  return (
    <View style={styles.locationElement}>
      <Pressable style={styles.titleContainer}
        onPress={() => handlePress({ id })}
        onLongPress={prepareToEditName}
      >
        <MaterialIcons name="store" size={fonts.rowIconSize} color={colors.lightBrandColor} />
        <View style={{ width: '100%' }}>
          <Text style={styles.title}>{location?.name}</Text>
          <Text style={styles.lastPurchaseDate}>most recent: {formatAsDate(location?.lastPurchaseDate!)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  locationElement: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.itemBackground,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    marginTop: 5,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: fonts.rowTextSize,
    fontWeight: 'bold',
    color: colors.lightBrandColor,
    width: '100%',
    marginLeft: 10,
  },
  lastPurchaseDate: {
    fontSize: fonts.badgeTextSize,
    fontStyle: 'italic',
    color: colors.lightBrandColor,
    width: '100%',
    paddingVertical: 5,
    marginLeft: 10,
  },
  titleInput: {
    backgroundColor: colors.lightBrandColor,
    color: colors.white,
    width: '100%',
    paddingRight: 5,
  },
});

export default observer(LocationElement);