import { ItemsApi, Item } from 'pantryplus-api-client/v2';
import { getApiConfiguration } from '@/services/SessionService';

const createItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }): Promise<Item | null> => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        const response = await itemsApi.createItem(xAuthUser, item);
        return response.data;
    } catch (error) {
        console.error(`Error creating item: ${error}`);
        return null;
    }
}

const updateItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        await itemsApi.updateItem(xAuthUser, item.id, item);
    } catch (error) {
        console.error(`Error updating item: ${error}`);
    }
}

export default {
    createItem,
    updateItem,
};
