import { ListsApi, Category, List, Item } from 'pantryplus-api-client/v1';
import { getApiConfiguration } from '@/services/SessionService';

const createList = async ({ list, xAuthUser }: { list: List, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    const { id, name, ownerId }  = list;
    try {
        const response = await listsApi.createList(xAuthUser, { id, name, ownerId, ordinal: 0 });
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
    }
}

const updateList = async ({ list, xAuthUser }: { list: Omit<List, "ownerId">, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    const { id, name, groupId = '', ordinal } = list;
    try {
        await listsApi.updateList(xAuthUser, id, { name, groupId, ordinal } );
    } catch (error) {
        console.error(`Failed to updateList in DB: ${error}`);
    }
} 

const removeList = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        await listsApi.deleteList(xAuthUser, listId);
    } catch (error) {
        console.error(`Failed to removeList in DB: ${error}`);
    }
}

const getListCategories = async ({ listId, xAuthUser, xAuthLocation }: { listId: string, xAuthUser: string, xAuthLocation: string }): Promise<Array<Category>> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        const categoriesData = await listsApi.getCategories(xAuthUser, xAuthLocation, listId);
        return categoriesData.data;
    } catch (error) {
        console.error(`Failed to getListCategories in DB: ${error}`);
        return [];
    }
}

const addListCategory = async ({ listId, category, xAuthUser, xAuthLocation }: { listId: string, category: Category, xAuthUser: string, xAuthLocation: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        const { id, name, ordinal } = category;
        await listsApi.createCategory(xAuthUser, xAuthLocation, listId, { id, name, listId, ordinal });
    } catch (error) {
        console.error(`Failed to addListCategory in DB: ${error}`);
    }
}

const deleteListCategory = async ({ listId, categoryId, xAuthUser }: { listId: string, categoryId: string, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        await listsApi.removeCategory(xAuthUser, listId, categoryId);
    } catch (error) {
        console.error(`Failed to deleteListCategory in DB: ${error}`);
    }
}

const getListItems = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }): Promise<Array<Item>> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        const itemsData = await listsApi.getListItems(xAuthUser, listId);
        return itemsData.data;
    } catch (error) {
        console.error(`Failed to getListItems in DB: ${error}`);
        return [];
    }
}

const associateListItem= async ({ listId, itemId, xAuthUser }: { listId: string, itemId: string, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        await listsApi.addItem(xAuthUser, listId, itemId);
    } catch (error) {
        console.error(`Failed to addListItem in DB: ${error}`);
    }
}

const removeListItem = async ({ listId, itemId, xAuthUser }: { listId?: string, itemId?: string, xAuthUser: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        if (!listId || !itemId) {
            throw new Error('List ID and item ID are required');
        }
        await listsApi.removeItem(xAuthUser, listId, itemId);
    } catch (error) {
        console.error(`Failed to removeListItem in DB: ${error}`);
    }
}

const purchaseItem = async ({ listId, itemId, xAuthUser, xAuthLocation }: { listId: string, itemId: string, xAuthUser: string, xAuthLocation: string }) => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        await listsApi.purchaseItem(xAuthUser, xAuthLocation, listId, itemId);
    } catch (error) {
        console.error(`Failed to purchaseItem in DB: ${error}`);
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
    purchaseItem,
};
