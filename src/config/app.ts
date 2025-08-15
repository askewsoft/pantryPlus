const appConfig = {
    apiUrl: `${process.env.EXPO_PUBLIC_API_URL}/v2`,
    debug: process.env.EXPO_PUBLIC_DEBUG === 'true'
} as const;

type AppConfig = typeof appConfig;

if (appConfig.debug) console.log('App Config = ', appConfig);

export default appConfig;