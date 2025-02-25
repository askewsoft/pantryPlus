import * as expoLocation from 'expo-location';

/*
    https://docs.expo.dev/versions/latest/sdk/location/#accuracy

    Lowest - Accurate to the nearest three kilometers.
    Low - Accurate to the nearest kilometer.
    Balanced - Accurate to within one hundred meters.
    High - Accurate to within ten meters of the desired target.
    Highest - The best level of accuracy available.
    BestForNavigation - The highest possible accuracy that uses additional sensor data to facilitate navigation apps.
*/

export const locationSubscription = {
    timeUpdateInterval: 5 * 60 * 1000, // in milliseconds
    distanceUpdateInterval: 100, // in meters
    accuracy: expoLocation.Accuracy.High,
    nearestStoreRadius: 15000, // in meters
};
