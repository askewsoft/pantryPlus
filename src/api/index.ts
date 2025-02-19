import shopperService from './shopperService';
import listService from './listService';
import categoryService from './categoryService';
import itemService from './itemService';
import groupService from './groupService';
import locationService from './locationService';

import { Configuration } from 'pantryplus-api-client';
import cognitoConfig from '@/config/cognito';

const configuration = new Configuration({
  basePath: cognitoConfig.apiUrl,
});

const api = {
    shopper: shopperService,
    list: listService,
    item: itemService,
    location: locationService,
    group: groupService,
    category: categoryService,
};

export default api;