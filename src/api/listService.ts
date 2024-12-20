import { ListsApi, Configuration, PickCategoryIdOrName_, List, Item } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);

const createList = async ({ list, xAuthUser }: { list: List, xAuthUser: string }) => {
    const { id, name, ownerId }  = list;
    logging.debug ? console.log(`createList: ${JSON.stringify({ id, name, ownerId, xAuthUser})}`) : null;
    try {
        const response = await listsApi.createList({ id, name, ownerId }, xAuthUser);
        logging.debug ? console.log(`createList response: ${JSON.stringify(response)}`) : null;
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
    }
}

const getListCategories = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }): Promise<Array<PickCategoryIdOrName_>> => {
    try {
        const categoriesData = await listsApi.getCategories(xAuthUser, listId);
        logging.debug ? console.log(`getListCategories response: ${JSON.stringify(categoriesData)}`) : null;
        return categoriesData.data;
    } catch (error) {
        console.error(`Failed to getListCategories in DB: ${error}`);
        return [];
    }
}

const addListCategory = async ({ listId, category, xAuthUser }: { listId: string, category: PickCategoryIdOrName_, xAuthUser: string }) => {
    try {
        const { id, name, ordinal } = category;
        await listsApi.createCategory({ id, name, listId, ordinal }, xAuthUser, listId);
    } catch (error) {
        console.error(`Failed to addListCategory in DB: ${error}`);
    }
}

const getListItems = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }): Promise<Array<Item>> => {
    try {
        const itemsData = await listsApi.getItems(xAuthUser, listId);
        return itemsData.data;
    } catch (error) {
        console.error(`Failed to getListItems in DB: ${error}`);
        return [];
    }
}

const associateListItem= async ({ listId, itemId, xAuthUser }: { listId: string, itemId: string, xAuthUser: string }) => {
    try {
        await listsApi.addItem(xAuthUser, listId, itemId);
    } catch (error) {
        console.error(`Failed to addListItem in DB: ${error}`);
    }
}

export default {
    createList,
    getListCategories,
    addListCategory,
    getListItems,
    associateListItem,
};