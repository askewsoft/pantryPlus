import { ItemsApi, Configuration, Item } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const itemsApi = new ItemsApi(configuration);

const createItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
    try {
        await itemsApi.createItem(item, xAuthUser);
    } catch (error) {
        console.error(`Error creating item: ${error}`);
    }
}

const updateItem = async ({ item, xAuthUser }: { item: Item, xAuthUser: string }) => {
    try {
        await itemsApi.updateItem(item, xAuthUser, item.id);
    } catch (error) {
        console.error(`Error updating item: ${error}`);
    }
}

export default {
    createItem,
    updateItem,
};