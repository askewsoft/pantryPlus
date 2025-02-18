import { ListsApi, Configuration, Category, List, Item } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);

const createList = async ({ list, xAuthUser }: { list: List, xAuthUser: string }) => {
    const { id, name, ownerId }  = list;
    try {
        const response = await listsApi.createList({ id, name, ownerId, ordinal: 0 }, xAuthUser);
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
    }
}

const updateList = async ({ list, xAuthUser }: { list: Omit<List, "ownerId">, xAuthUser: string }) => {
    const { id, name, groupId = '', ordinal } = list;
    try {
        await listsApi.updateList({ name, groupId, ordinal }, xAuthUser, id );
    } catch (error) {
        console.error(`Failed to updateList in DB: ${error}`);
    }
} 

const removeList = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }) => {
    try {
        await listsApi.deleteList(xAuthUser, listId);
    } catch (error) {
        console.error(`Failed to removeList in DB: ${error}`);
    }
}

const getListCategories = async ({ listId, xAuthUser, xAuthLocation }: { listId: string, xAuthUser: string, xAuthLocation: string }): Promise<Array<Category>> => {
    try {
        const categoriesData = await listsApi.getCategories(xAuthUser, xAuthLocation, listId);
        return categoriesData.data;
    } catch (error) {
        console.error(`Failed to getListCategories in DB: ${error}`);
        return [];
    }
}

const addListCategory = async ({ listId, category, xAuthUser, xAuthLocation }: { listId: string, category: Category, xAuthUser: string, xAuthLocation: string }) => {
    try {
        const { id, name, ordinal } = category;
        await listsApi.createCategory({ id, name, listId, ordinal }, xAuthUser, xAuthLocation, listId);
    } catch (error) {
        console.error(`Failed to addListCategory in DB: ${error}`);
    }
}

const deleteListCategory = async ({ listId, categoryId, xAuthUser }: { listId: string, categoryId: string, xAuthUser: string }) => {
    try {
        await listsApi.removeCategory(xAuthUser, listId, categoryId);
    } catch (error) {
        console.error(`Failed to deleteListCategory in DB: ${error}`);
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

const removeListItem = async ({ listId, itemId, xAuthUser }: { listId?: string, itemId?: string, xAuthUser: string }) => {
    try {
        if (!listId || !itemId) {
            throw new Error('List ID and item ID are required');
        }
        await listsApi.removeItem(xAuthUser, listId, itemId);
    } catch (error) {
        console.error(`Failed to removeListItem in DB: ${error}`);
    }
}

export default {
    createList,
    getListCategories,
    addListCategory,
    deleteListCategory,
    getListItems,
    associateListItem,
    removeListItem,
    updateList,
    removeList,
};
