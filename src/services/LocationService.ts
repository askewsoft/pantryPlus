import { Alert } from 'react-native';
import * as expoLocation from 'expo-location';

import { locationSubscription } from '@/config/locationSubscription';
import { domainStore } from '@/stores/DomainStore';
import { api } from '@/api';
import appConfig from '@/config/app';

class LocationService {
    private subscription: expoLocation.LocationSubscription | null = null;

    private async requestPermissions(): Promise<boolean> {
        const { status } = await expoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return false;
        }
        return true;
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

                    const nearestKnownLocationId = await api.location.getNearestStore(email, location);
                    if (nearestKnownLocationId !== domainStore.nearestKnownLocationId) {
                        domainStore.setNearestKnownLocationId(nearestKnownLocationId ?? null);
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