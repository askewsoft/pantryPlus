import { CategoriesApi, Item } from 'pantryplus-api-client/v2';
import { getApiConfiguration } from '@/services/SessionService';

const updateCategory = async ({ categoryId, name, ordinal, xAuthUser, xAuthLocation }: { categoryId: string, name: string, ordinal: number, xAuthUser: string, xAuthLocation: string }) => {
    const configuration = await getApiConfiguration();
    const categoriesApi = new CategoriesApi(configuration);
    try {
        await categoriesApi.updateCategory(xAuthUser, xAuthLocation, categoryId, { name, ordinal });
    } catch (error) {
        console.error(`Error updating category: ${error}`);
    }
}

const associateCategoryItem = async ({ categoryId, itemId, xAuthUser }: { categoryId: string, itemId: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const categoriesApi = new CategoriesApi(configuration);
    try {
        await categoriesApi.addItemToCategory(xAuthUser, categoryId, itemId);
    } catch (error) {
        console.error(`Error adding category item: ${error}`);
    }
}

const loadCategoryItems = async ({ categoryId, xAuthUser }: { categoryId: string, xAuthUser: string }): Promise<Array<Item>> => {
    const configuration = await getApiConfiguration();
    const categoriesApi = new CategoriesApi(configuration);
    let returnItems: Array<Item> = [];
    try {
        const itemsData = await categoriesApi.getCategoryItems(xAuthUser, categoryId);
        returnItems = itemsData.data;
    } catch (error) {
        console.error(`Error loading category items: ${error}`);
    }
    return returnItems;
}

const removeCategoryItem = async ({ categoryId, itemId, xAuthUser }: { categoryId?: string, itemId?: string, xAuthUser: string }): Promise<void> => {
    const configuration = await getApiConfiguration();
    const categoriesApi = new CategoriesApi(configuration);
    try {
        if (!categoryId || !itemId) {
            throw new Error('Category ID and item ID are required');
        }
        await categoriesApi.removeItemFromCategory(xAuthUser, categoryId, itemId);
    } catch (error) {
        console.error(`Error removing category item: ${error}`);
    }
}

export default {
    updateCategory,
    associateCategoryItem,
    loadCategoryItems,
    removeCategoryItem,
};