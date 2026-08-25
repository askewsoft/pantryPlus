import { ListsApi, Category, List, Item, ReorderCategoriesAtLocationRequest } from 'pantryplus-api-client/v3';
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
    const { id, name, groupId, ordinal } = list;
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

const getItemCategories = async ({
    listId,
    itemId,
    xAuthUser,
}: {
    listId: string;
    itemId: string;
    xAuthUser: string;
}): Promise<Array<{ id?: string; name?: string }>> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        const response = await listsApi.getItemCategories(xAuthUser, listId, itemId);
        return response.data ?? [];
    } catch (error) {
        console.error(`Failed to getItemCategories in DB: ${error}`);
        return [];
    }
};

/** Clear all category links for an item on this list; keep list membership. */
const clearItemCategories = async ({
    listId,
    itemId,
    xAuthUser,
}: {
    listId: string;
    itemId: string;
    xAuthUser: string;
}): Promise<void> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        await listsApi.clearItemCategories(xAuthUser, listId, itemId);
    } catch (error) {
        console.error(`Failed to clearItemCategories in DB: ${error}`);
        throw error;
    }
};

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
        throw error;
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

const getListItemsCount = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }): Promise<number> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    try {
        const countData = await listsApi.getListItemsCount(xAuthUser, listId);
        return countData.data.count;
    } catch (error) {
        console.error(`Failed to getListItemsCount in DB: ${error}`);
        return 0;
    }
}

const reorderCategoriesAtLocation = async ({
    listId,
    orderedCategoryIds,
    xAuthUser,
    xAuthLocation,
}: {
    listId: string;
    orderedCategoryIds: string[];
    xAuthUser: string;
    xAuthLocation: string;
}): Promise<void> => {
    const configuration = await getApiConfiguration();
    const listsApi = new ListsApi(configuration);
    const body: ReorderCategoriesAtLocationRequest = { orderedCategoryIds };
    try {
        await listsApi.reorderCategoriesAtLocation(xAuthUser, xAuthLocation, listId, body);
    } catch (error) {
        console.error(`Failed to reorder categories in DB: ${error}`);
        throw error;
    }
};

export default {
    createList,
    getListCategories,
    addListCategory,
    deleteListCategory,
    getListItems,
    getListItemsCount,
    associateListItem,
    getItemCategories,
    clearItemCategories,
    removeListItem,
    updateList,
    removeList,
    purchaseItem,
    reorderCategoriesAtLocation,
};
