const appConfig = {
    apiUrl: `${process.env.EXPO_PUBLIC_API_URL}/v2`,
    debug: process.env.EXPO_PUBLIC_DEBUG === 'true'
} as const;

type AppConfig = typeof appConfig;

if (appConfig.debug) {
    console.log('App Config = ', appConfig);
    console.log('EXPO_PUBLIC_API_URL =', process.env.EXPO_PUBLIC_API_URL);
    console.log('Final API URL =', appConfig.apiUrl);
}

export default appConfig;