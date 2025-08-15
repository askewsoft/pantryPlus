import { ItemsApi, Item } from 'pantryplus-api-client/v2';
import { getApiConfiguration } from '@/services/SessionService';

const createItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        await itemsApi.createItem(xAuthUser, item);
    } catch (error) {
        console.error(`Error creating item: ${error}`);
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