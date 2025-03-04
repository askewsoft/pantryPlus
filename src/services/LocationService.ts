import { Alert } from 'react-native';
import * as expoLocation from 'expo-location';

import { locationSubscription } from '@/config/locationSubscription';
import { domainStore, LocationType } from '@/stores/DomainStore';
import { api } from '@/api';

class LocationService {
    private subscription: expoLocation.LocationSubscription | null = null;

    private async requestPermissions(): Promise<boolean> {
        const { status } = await expoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return false;
        }
        return true;
    }

    async setNearestKnownLocation(): Promise<void> {
        const email = domainStore.user?.email;
        if (!email) return;
        try {
            const location = await expoLocation.getCurrentPositionAsync();
            if (!location) return;
            const nearestLocationProps = await api.location.getNearestStore(email, location) as LocationType;
            if (!nearestLocationProps) return;
            domainStore.setNearestKnownLocation(nearestLocationProps);
        } catch (error) {
            console.error('unable to setNearestKnownLocation:', error);
        }
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
    }
}

export const locationService = new LocationService();