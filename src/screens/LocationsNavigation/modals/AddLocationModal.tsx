import { Modal, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react';

import { uiStore } from '@/stores/UIStore';
import { domainStore } from '@/stores/DomainStore';
import { locationService } from '@/services/LocationService';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AddLocationModal = () => {
  return (
    <Modal
      visible={uiStore.addLocationModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create New Location</Text>
        <TextInput
            style={styles.input}
            autoFocus={true}
            inputMode="text"
            lineBreakStrategyIOS="none"
            clearButtonMode="while-editing"
            enablesReturnKeyAutomatically={true}
            keyboardAppearance="light"
            maxLength={100}
            placeholder="Location Name"
            placeholderTextColor={colors.lightBrandColor}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={onSubmitCurrentLocation}
        />
        <Button
            title="Cancel"
            onPress={() => uiStore.setAddLocationModalVisible(false)}
            color={colors.white}
        />
      </View>
    </Modal>
  );
}

const onSubmitCurrentLocation = async (evt: any) => {
  // Capture the text value immediately to avoid event reuse issues
  const locationName = evt.nativeEvent.text;

  try {
    const locationExplicitlyDisabled = domainStore.locationExplicitlyDisabled;
    if (locationExplicitlyDisabled) {
      Alert.alert(
          'Location Permission Required',
          'Please enable location permission in settings to create a new location',
          [{ text: 'OK' }]
      );
      return; // Don't proceed if permissions are disabled
    }

    const permissionsGranted = await locationService.requestPermissions();
    if (!permissionsGranted) {
      Alert.alert(
          'Location Permission Denied',
          'You cannot record a location without granting permission.',
          [{ text: 'OK' }]
      );
      return; // Don't proceed if permissions are denied
    }

    // Create the location
    await domainStore.addLocation({ name: locationName });
    uiStore.setAddLocationModalVisible(false);
  } catch (error) {
    console.error('Failed to create location:', error);

    // Provide more specific error messages
    let errorMessage = 'Unable to get your current location. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('Location request timed out')) {
        errorMessage = 'Location request timed out. Please check your location settings and try again.';
      } else if (error.message.includes('Location service is disabled')) {
        errorMessage = 'Location services are disabled. Please enable them in Settings and try again.';
      } else if (error.message.includes('Location unavailable')) {
        errorMessage = 'Location is currently unavailable. Please try again in a moment.';
      }
    }

    Alert.alert('Location Error', errorMessage);
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    marginTop: '50%',
  },
  modalTitle: {
    fontSize: fonts.modalTitleSize,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 60,
    color: colors.white,
  },
  input: {
    height: 40,
    minWidth: "80%",
    backgroundColor: colors.white,
    marginBottom: 30,
    padding: 10,
    textAlign: 'center',
    fontSize: fonts.rowTextSize,
  },
});

export default observer(AddLocationModal);