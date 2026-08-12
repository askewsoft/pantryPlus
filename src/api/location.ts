import { LocationsApi, Location, LocationArea } from 'pantryplus-api-client/v2';
import { getApiConfiguration } from '@/services/SessionService';
import * as expoLocation from 'expo-location';
import { Alert } from 'react-native';
import { locationSubscription } from '@/config/locationSubscription';

/** Must match API LOCATION_FIND_OR_CREATE_RADIUS_METERS */
const FIND_OR_CREATE_RADIUS_METERS = 50;

function asLocation(value: unknown): Location | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const candidate = value as Partial<Location>;
    if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string') return undefined;
    if (typeof candidate.latitude !== 'number' || typeof candidate.longitude !== 'number') return undefined;
    return candidate as Location;
}

const createLocation = async ({ location, xAuthUser }: { location: Location, xAuthUser: string }): Promise<Location> => {
    const configuration = await getApiConfiguration();
    const locationsApi = new LocationsApi(configuration);
    try {
        // Runtime body is Location (201 create / 200 reuse). Client typings may still say void
        // until regenerated from swagger that schemas both success responses as Location.
        const response = await locationsApi.createLocation(xAuthUser, location);
        const fromBody = asLocation(response.data);
        if (fromBody) {
            return fromBody;
        }

        // Fallback if the response body was empty/untyped: resolve via nearby find-or-create radius
        const nearby = await getNearbyLocations({
            xAuthUser,
            locationArea: {
                latitude: location.latitude,
                longitude: location.longitude,
                radius: FIND_OR_CREATE_RADIUS_METERS,
            },
        });
        if (nearby.length > 0) {
            return nearby[0];
        }
        return location;
    } catch (error) {
        console.error(`Failed to createLocation in DB: ${error}`);
        throw error;
    }
}

const updateLocationName = async ({ locationId, name, xAuthUser }: { locationId: string, name: string, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const locationsApi = new LocationsApi(configuration);
    try {
        await locationsApi.updateLocation(xAuthUser, locationId, { name });
    } catch (error) {
        console.error(`Failed to updateLocation in DB: ${error}`);
        throw error;
    }
}

const getNearbyLocations = async ({ xAuthUser, locationArea }: { xAuthUser: string, locationArea: LocationArea }): Promise<Location[]> => {
    const configuration = await getApiConfiguration();
    const locationsApi = new LocationsApi(configuration);
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
