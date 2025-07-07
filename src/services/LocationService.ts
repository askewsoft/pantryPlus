import { Alert } from 'react-native';
import * as expoLocation from 'expo-location';

import { locationSubscription } from '@/config/locationSubscription';
import { domainStore, LocationType } from '@/stores/DomainStore';
import { api } from '@/api';

class LocationService {
    private subscription: expoLocation.LocationSubscription | null = null;

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
        // First stop any existing tracking to ensure clean state
        this.stopTracking();

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
                    const email = domainStore.user?.email;
                    if (!email) return;

                    const nearestKnownLocationProps = await api.location.getNearestStore(email, location) as LocationType;
                    if (!nearestKnownLocationProps) return;
                    if (nearestKnownLocationProps.id !== domainStore.selectedKnownLocationId) {
                        domainStore.setNearestKnownLocation(nearestKnownLocationProps);
                        domainStore.setSelectedKnownLocationId(nearestKnownLocationProps.id ?? null);
                    }
                }
            );

        } catch (error) {
            console.error('unable to start location tracking:', error);
            Alert.alert('Failed to start location tracking', 'Please try again enabling location permission in Settings first');
            domainStore.setLocationEnabled(false);
        }
    }

    stopTracking() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
        domainStore.setNearestKnownLocation(null);
        domainStore.setSelectedKnownLocationId(null);
    }
}

export const locationService = new LocationService();