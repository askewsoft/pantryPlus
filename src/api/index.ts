import {
    ListsApi,
    LocationsApi,
    GroupsApi,
    CategoriesApi,
    ShoppersApi,
    Configuration
} from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const listsApi = new ListsApi(configuration);
const locationsApi = new LocationsApi(configuration);
const groupsApi = new GroupsApi(configuration);
const categoriesApi = new CategoriesApi(configuration);
const shopperApi = new ShoppersApi(configuration);

const api = {
    shopper: shopperApi,
    list: listsApi,
    location: locationsApi,
    group: groupsApi,
    category: categoriesApi,
};

export default api;