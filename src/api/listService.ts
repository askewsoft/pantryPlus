import { ListsApi, Configuration } from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';
import { ListType } from '@/stores/DomainStore';
import { CategoryModel } from '@/stores/models/Category';
import { ItemModel } from '@/stores/models/Item';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);

const createList = async ({ list, ownerId, xAuthUser }: { list: ListType, ownerId: string, xAuthUser: string }) => {
    const { id, name }  = list;
    try {
        await listsApi.createList({ id, name, ownerId }, xAuthUser);
    } catch (error) {
        console.error(`Failed to createList in DB: ${error}`);
        throw error;
    }
}

const getListCategories = async ({ listId, xAuthUser }: { listId: string, xAuthUser: string }) => {
    const categoriesData = await listsApi.getCategories(listId, xAuthUser);
    const categories = categoriesData.data.map(
        (category) => CategoryModel.create(category)
    );
    return categories;
}

const getListCategoryItems = async ({ listId, categoryId, xAuthUser }: { listId: string, categoryId: string, xAuthUser: string }) => {
    const itemsData = await listsApi.getItems(listId, categoryId, xAuthUser);
    const items = itemsData.data.map(
        (item) => ItemModel.create(item)
    );
    return items;
}

export default {
    createList,
    getListCategories,
    getListCategoryItems,
};