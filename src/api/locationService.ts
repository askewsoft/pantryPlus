import { LocationsApi, Configuration, Location, LocationArea } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import * as expoLocation from 'expo-location';
import logging from '@/config/logging';
import { Alert } from 'react-native';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const locationsApi = new LocationsApi(configuration);

const createLocation = async ({ location, xAuthUser }: { location: Location, xAuthUser: string }) => {
    try {
        await locationsApi.createLocation(location, xAuthUser);
    } catch (error) {
        console.error(`Failed to createLocation in DB: ${error}`);
    }
}

const updateLocationName = async ({ location, xAuthUser }: { location: Location, xAuthUser: string }) => {
    const { id, name } = location;
    try {
        await locationsApi.updateLocation({ name }, xAuthUser, id );
    } catch (error) {
        console.error(`Failed to updateLocation in DB: ${error}`);
    }
} 

// const removeLocation = async ({ locationId, xAuthUser }: { locationId: string, xAuthUser: string }) => {
//     try {
//         await locationsApi.deleteLocation(xAuthUser, locationId);
//     } catch (error) {
//         console.error(`Failed to removeList in DB: ${error}`);
//     }
// }

const getNearbyLocations = async ({ xAuthUser, locationArea }: { xAuthUser: string, locationArea: LocationArea }): Promise<Location[]> => {
    try {
        const locationsData = await locationsApi.getNearbyLocations(locationArea, xAuthUser);
        return locationsData.data;
    } catch (error) {
        console.error(`Failed to getNearbyLocations in DB: ${error}`);
        return [];
    }
}

const getCurrentLocation = async (): Promise<expoLocation.LocationObject | undefined> => {
    const { status } = await expoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Location permission not granted');
        return;
    }
    const currentLocation = await expoLocation.getCurrentPositionAsync();
    return currentLocation;
}

const getNearestStore = async (xAuthUser: string): Promise<string | undefined> => {
    const userLocation = await getCurrentLocation();
    if (!userLocation) return;

    const locationArea: LocationArea = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        // TODO: make radius dynamic so that distance can be adjusted by the user?
        radius: 15000, // in meters
    }
    const nearestStores = await getNearbyLocations({ xAuthUser, locationArea });
    return nearestStores[0]?.id;
}

export default {
    createLocation,
    updateLocationName,
    getCurrentLocation,
    getNearbyLocations,
    getNearestStore,
};