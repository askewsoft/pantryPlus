import { LocationsApi, Configuration, Location, LocationArea } from 'pantryplus-api-client';
import appConfig from '@/config/app';
import * as expoLocation from 'expo-location';
import { Alert } from 'react-native';
import { locationSubscription } from '@/config/locationSubscription';

const configuration = new Configuration({ basePath: appConfig.apiUrl });
const locationsApi = new LocationsApi(configuration);

const createLocation = async ({ location, xAuthUser }: { location: Location, xAuthUser: string }) => {
    try {
        await locationsApi.createLocation(xAuthUser, location);
    } catch (error) {
        console.error(`Failed to createLocation in DB: ${error}`);
    }
}

const updateLocationName = async ({ location, xAuthUser }: { location: Location, xAuthUser: string }) => {
    const { id, name } = location;
    try {
        await locationsApi.updateLocation(xAuthUser, id, { name });
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
        const locationsData = await locationsApi.getNearbyLocations(xAuthUser, locationArea);
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

const getNearestStore = async (xAuthUser: string, locationObject?: expoLocation.LocationObject): Promise<Location | undefined> => {
    let userLocation = locationObject;
    if (!userLocation) {
        userLocation = await getCurrentLocation();
    }
    if (!userLocation) return;

    const locationArea: LocationArea = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        radius: locationSubscription.nearestStoreRadius, // TODO: consider making radius user adjustable
    }
    const nearestStores = await getNearbyLocations({ xAuthUser, locationArea });
    return nearestStores[0];
}

export default {
    createLocation,
    updateLocationName,
    getCurrentLocation,
    getNearestStore,
};