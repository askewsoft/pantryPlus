import { fetchAuthSession } from 'aws-amplify/auth';
import { Configuration } from 'pantryplus-api-client/v1';
import appConfig from '@/config/app';

export const getApiConfiguration = async (): Promise<Configuration | undefined> => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        
        return new Configuration({
            basePath: appConfig.apiUrl,
            accessToken: token
        });
    } catch (error) {
        console.error('Error getting auth token:', error);
        return undefined;
    }
}; 