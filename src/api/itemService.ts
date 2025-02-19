import { ItemsApi, Configuration, Item } from 'pantryplus-api-client';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const itemsApi = new ItemsApi(configuration);

const createItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
    try {
        await itemsApi.createItem(xAuthUser, item);
    } catch (error) {
        console.error(`Error creating item: ${error}`);
    }
}

const updateItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
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