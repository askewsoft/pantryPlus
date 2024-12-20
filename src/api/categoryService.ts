import { CategoriesApi, Configuration, Item } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const categoriesApi = new CategoriesApi(configuration);

const updateCategory = async ({ categoryId, name, ordinal, xAuthUser }: { categoryId: string, name: string, ordinal: number, xAuthUser: string }) => {
    logging.debug ? console.log(`updateCategory: ${categoryId} ${name} ${ordinal} ${xAuthUser}`) : null;
    try {
        await categoriesApi.updateCategory({ name, ordinal }, xAuthUser, categoryId);
    } catch (error) {
        console.error(`Error updating category: ${error}`);
    }
}

const associateCategoryItem = async ({ categoryId, itemId, xAuthUser }: { categoryId: string, itemId: string, xAuthUser: string }): Promise<void> => {
    try {
        await categoriesApi.addItemToCategory(xAuthUser, categoryId, itemId);
    } catch (error) {
        console.error(`Error adding category item: ${error}`);
    }
}

const loadCategoryItems = async ({ categoryId, xAuthUser }: { categoryId: string, xAuthUser: string }): Promise<Array<Item>> => {
    let returnItems: Array<Item> = [];
    try {
        logging.debug ? console.log(`categoryService fetching Items: ${categoryId} ${xAuthUser}`) : null;
        const itemsData = await categoriesApi.getCategoryItems(xAuthUser, categoryId);
        returnItems = itemsData.data;
        logging.debug ? console.log(`categoryService Items received: ${JSON.stringify(returnItems)}`) : null;
    } catch (error) {
        console.error(`Error loading category items: ${error}`);
    }
    return returnItems;
}

export default {
    updateCategory,
    associateCategoryItem,
    loadCategoryItems,
};