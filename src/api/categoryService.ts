import { CategoriesApi, Configuration, Item } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const categoriesApi = new CategoriesApi(configuration);

const updateCategory = async ({ categoryId, name, xAuthUser }: { categoryId: string, name: string, xAuthUser: string }) => {
    logging.debug ? console.log(`updateCategory: ${categoryId} ${name} ${xAuthUser}`) : null;
    try {
        const results = await categoriesApi.updateCategory({ name }, xAuthUser, categoryId);
        logging.debug ? console.log(`updateCategory results: ${JSON.stringify(results)}`) : null;
    } catch (error) {
        console.error(`Error updating category: ${error}`);
        // throw error;
    }
}

const associateCategoryItem = async ({ categoryId, itemId, xAuthUser }: { categoryId: string, itemId: string, xAuthUser: string }): Promise<void> => {
    try {
        await categoriesApi.addItemToCategory(xAuthUser, categoryId, itemId);
    } catch (error) {
        console.error(`Error adding category item: ${error}`);
        // throw error;
    }
}

const loadCategoryItems = async ({ categoryId, xAuthUser }: { categoryId: string, xAuthUser: string }): Promise<Array<Item>> => {
    try {
        const itemsData = await categoriesApi.getCategoryItems(xAuthUser, categoryId);
        return itemsData.data;
    } catch (error) {
        console.error(`Error loading category items: ${error}`);
        // throw error;
    }
}

export default {
    updateCategory,
    associateCategoryItem,
    loadCategoryItems,
};