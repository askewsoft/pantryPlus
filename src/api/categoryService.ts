import { CategoriesApi, Configuration } from 'pantryPlusApiClient';
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
        throw error;
    }
}

export default {
    updateCategory,
};
