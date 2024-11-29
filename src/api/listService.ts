import { ListsApi, Configuration } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import { ListType } from '@/models/DomainStore';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);

const createList = async (list: ListType, ownerId: string, xAuthUser: string) => {
    const { id, name }  = list;
    try {
        await listsApi.createList({ id, name, ownerId }, xAuthUser);
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
        throw error;
    }
}

export default {
    createList,
};