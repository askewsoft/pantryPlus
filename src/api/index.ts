import shopperService from './shopperService';
import listService from './listService';
import categoryService from './categoryService';
import itemService from './itemService';

import {
    LocationsApi,
    GroupsApi,
    Configuration
} from 'pantryPlusApiClient';
import cognitoConfig from '@/config/cognito';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const locationsApi = new LocationsApi(configuration);
const groupsApi = new GroupsApi(configuration);

const api = {
    shopper: shopperService,
    list: listService,
    item: itemService,
    location: locationsApi,
    group: groupsApi,
    category: categoryService,
};

export default api;