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

const updateItem = async ({
    item,
    listId,
    xAuthUser,
}: {
    item: Item;
    listId: string;
    xAuthUser: string;
}): Promise<Item | null> => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        const response = await itemsApi.updateItem(xAuthUser, item.id, {
            name: item.name,
            upc: item.upc,
            listId,
        });
        return response.data ?? null;
    } catch (error) {
        console.error(`Error updating item: ${error}`);
        return null;
    }
}

export default {
    createItem,
    updateItem,
};
