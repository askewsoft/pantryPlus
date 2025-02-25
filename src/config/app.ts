const { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_DEBUG } = process.env;

console.log('DEBUG LOGGING = ', EXPO_PUBLIC_DEBUG);

type AppConfig = {
    apiUrl: string | undefined;
    debug: boolean | undefined;
}

const appConfig: AppConfig = {
    apiUrl: EXPO_PUBLIC_API_URL,
    debug: EXPO_PUBLIC_DEBUG === 'true'
}

export default appConfig as AppConfig;