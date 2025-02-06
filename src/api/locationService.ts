import { LocationsApi, Configuration, Location, Category } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

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

export default {
    createLocation,
    updateLocationName,
    // removeLocation,
};