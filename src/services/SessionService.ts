import { fetchAuthSession } from 'aws-amplify/auth';
import { Configuration } from 'pantryplus-api-client/v1';
import appConfig from '@/config/app';

export const getApiConfiguration = async (): Promise<Configuration | undefined> => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        
        if (appConfig.debug) {
            console.error('API URL = ', appConfig.apiUrl);
            console.error('Auth Token Present = ', !!token);
            console.error('Auth Token = ', token);
        }

        const config = new Configuration({
            basePath: appConfig.apiUrl,
            accessToken: token
        });

        if (appConfig.debug) {
            console.error('API Configuration created with basePath:', config.basePath);
        }

        return config;
    } catch (error) {
        console.error('Error getting auth token:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
        return undefined;
    }
}; 