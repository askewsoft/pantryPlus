import shopperService from './shopperService';
import listService from './listService';

import {
    LocationsApi,
    GroupsApi,
    CategoriesApi,
    Configuration
} from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const locationsApi = new LocationsApi(configuration);
const groupsApi = new GroupsApi(configuration);
const categoriesApi = new CategoriesApi(configuration);

const api = {
    shopper: shopperService,
    list: listService,
    location: locationsApi,
    group: groupsApi,
    category: categoriesApi,
};

export default api;