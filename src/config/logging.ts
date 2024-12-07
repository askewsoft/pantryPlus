const { EXPO_PUBLIC_DEBUG } = process.env;
console.log('DEBUG LOGGING = ', EXPO_PUBLIC_DEBUG);

export default {
    debug: EXPO_PUBLIC_DEBUG === 'true',
};
