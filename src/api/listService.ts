import { ListsApi, Configuration, Category } from 'pantryPlusApiClient';
import { ListType } from '@/stores/DomainStore';
import { CategoryModel } from '@/stores/models/Category';
import { ItemModel } from '@/stores/models/Item';
import cognitoConfig from '@/config/cognito';
import logging from '@/config/logging';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);

const createList = async ({ list, ownerId, xAuthUser }: { list: ListType, ownerId: string, xAuthUser: string }) => {
    const { id, name }  = list;
    logging.debug ? console.log(`createList: ${JSON.stringify({ id, name, ownerId, xAuthUser})}`) : null;
    try {
        const response = await listsApi.createList({ id, name, ownerId }, xAuthUser);
        logging.debug ? console.log(`createList response: ${JSON.stringify(response)}`) : null;
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
        throw error;
    }
}

const getListCategories = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }) => {
    try {
        const categoriesData = await listsApi.getCategories(xAuthUser, listId);
        const categories = categoriesData.data.map(
            (category) => {
                const { id, name } = category;
                return CategoryModel.create({ id, name, items: [] });
            }
        );
        return categories;
    } catch (error) {
        console.error(`Failed to getListCategories in DB: ${error}`);
        throw error;
    }
}

const getListCategoryItems = async ({ listId, categoryId, xAuthUser }: { listId: string, categoryId: string, xAuthUser: string }) => {
    const itemsData = await listsApi.getItems(xAuthUser, listId, categoryId);
    const items = itemsData.data.map(
        (item) => ItemModel.create(item)
    );
    return items;
}

const addListCategory = async ({ listId, category, xAuthUser }: { listId: string, category: Category, xAuthUser: string }) => {
    try {
        const { id, name } = category;
        await listsApi.addCategory({ id, name, listId }, xAuthUser, listId);
    } catch (error) {
        console.error(`Failed to addListCategory in DB: ${error}`);
        throw error;
    }
}

export default {
    createList,
    getListCategories,
    getListCategoryItems,
    addListCategory,
};