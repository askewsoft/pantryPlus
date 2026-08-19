import { ItemsApi, Item, ItemAlias } from 'pantryplus-api-client/v3';
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

const listItemAliases = async ({
    itemId,
    xAuthUser,
}: {
    itemId: string;
    xAuthUser: string;
}): Promise<Array<ItemAlias>> => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        const response = await itemsApi.listItemAliases(xAuthUser, itemId);
        return response.data ?? [];
    } catch (error) {
        console.error(`Error listing item aliases: ${error}`);
        return [];
    }
};

const createItemAlias = async ({
    itemId,
    name,
    xAuthUser,
}: {
    itemId: string;
    name: string;
    xAuthUser: string;
}): Promise<ItemAlias | null> => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        const response = await itemsApi.createItemAlias(xAuthUser, itemId, { name });
        return response.data ?? null;
    } catch (error) {
        console.error(`Error creating item alias: ${error}`);
        return null;
    }
};

const deleteItemAlias = async ({
    itemId,
    aliasName,
    xAuthUser,
}: {
    itemId: string;
    aliasName: string;
    xAuthUser: string;
}): Promise<boolean> => {
    const configuration = await getApiConfiguration();
    const itemsApi = new ItemsApi(configuration);
    try {
        await itemsApi.deleteItemAlias(xAuthUser, itemId, aliasName);
        return true;
    } catch (error) {
        console.error(`Error deleting item alias: ${error}`);
        return false;
    }
};

export default {
    createItem,
    updateItem,
    listItemAliases,
    createItemAlias,
    deleteItemAlias,
};
