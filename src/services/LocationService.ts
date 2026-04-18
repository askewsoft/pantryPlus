import { Alert } from 'react-native';
import * as expoLocation from 'expo-location';

import { locationSubscription } from '@/config/locationSubscription';
import { domainStore, LocationType } from '@/stores/DomainStore';
import { api } from '@/api';

class LocationService {
    private subscription: expoLocation.LocationSubscription | null = null;

    private async applyNearestKnownFromExpoLocation(location: expoLocation.LocationObject) {
        const email = domainStore.user?.email;
        if (!email) return;

        try {
            const nearestKnownLocationProps = await api.location.getNearestStore(email, location) as LocationType | undefined;
            if (!nearestKnownLocationProps) return;
            if (nearestKnownLocationProps.id !== domainStore.selectedKnownLocationId) {
                domainStore.setNearestKnownLocation(nearestKnownLocationProps);
                domainStore.setSelectedKnownLocationId(nearestKnownLocationProps.id ?? null);
            }
        } catch (error) {
            console.error('Failed to resolve nearest store from position:', error);
        }
    }

    async requestPermissions(): Promise<boolean> {
        // Check if user has explicitly disabled location in the app
        if (domainStore.locationExplicitlyDisabled) {
            return false;
        }
        
        const { status } = await expoLocation.requestForegroundPermissionsAsync();
        const locationEnabled = status === 'granted';
        if (locationEnabled) {
            domainStore.setLocationEnabled(true);
        } else {
            domainStore.setLocationEnabled(false);
        }
        return locationEnabled;
    }

    async startTracking() {
        // Replace subscription only — do not clear selected location (persisted / last known).
        this.stopTracking(false);

        const locationSubscriptionOptions = {
            accuracy: locationSubscription.accuracy,
            timeInterval: locationSubscription.timeUpdateInterval,
            distanceInterval: locationSubscription.distanceUpdateInterval,
        };

        try {
            const permissionsGranted = await this.requestPermissions();
            if (!permissionsGranted) {
                Alert.alert('Location permission denied', 'Please enable location permission in settings to use this feature');
                domainStore.setLocationEnabled(false);
                return;
            }

            // Start watching position
            this.subscription = await expoLocation.watchPositionAsync(
                locationSubscriptionOptions,
                async (location) => {
                    await this.applyNearestKnownFromExpoLocation(location);
                }
            );

            // watchPositionAsync may not fire until movement or the time interval elapses; resolve nearest store now
            // so ShoppingList loads use location ordering immediately.
            try {
                const current = await expoLocation.getCurrentPositionAsync({
                    accuracy: locationSubscription.accuracy,
                });
                await this.applyNearestKnownFromExpoLocation(current);
            } catch (error) {
                console.error('Unable to get immediate position for nearest store:', error);
            }

        } catch (error) {
            console.error('unable to start location tracking:', error);
            Alert.alert('Failed to start location tracking', 'Please try again enabling location permission in Settings first');
            domainStore.setLocationEnabled(false);
        }
    }

    stopTracking(clearSelection = true) {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
        if (clearSelection) {
            domainStore.setNearestKnownLocation(null);
            domainStore.setSelectedKnownLocationId(null);
        }
    }
}

export const locationService = new LocationService();