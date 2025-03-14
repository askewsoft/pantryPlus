import { Instance, t } from 'mobx-state-tree';

import { AppTabs } from './AppNavTypes';
import { ListsStack } from './ListNavTypes';
import { GroupsStack } from './GroupNavTypes';
import { SettingsStack } from './SettingsNavTypes';
import { LocationsStack } from './LocationNavTypes';

const ListsStackMstEnum = t.enumeration('ListsStackMst', [...ListsStack]);
type ListsStackMstType = Instance<typeof ListsStackMstEnum>;

const GroupsStackMstEnum = t.enumeration('GroupsStackMst', [...GroupsStack]);
type GroupsStackMstType = Instance<typeof GroupsStackMstEnum>;

const SettingsStackMstEnum = t.enumeration('SettingsStackMst', [...SettingsStack]);
type SettingsStackMstType = Instance<typeof SettingsStackMstEnum>;

const LocationsStackMstEnum = t.enumeration('LocationsStackMst', [...LocationsStack]);
type LocationsStackMstType = Instance<typeof LocationsStackMstEnum>;

// Mobx-state-tree enumeration type to be used in MST Stores
export const AppTabsMstEnum = t.enumeration('AppTabsMst', [...AppTabs, 'IntroScreen', 'WelcomeScreen']);
export type AppTabsMstType = Instance<typeof AppTabsMstEnum>;

export const AppSubTabsMstEnum = t.enumeration('AppSubTabsMst', [...ListsStack, ...GroupsStack, ...SettingsStack, ...LocationsStack, '']);
export type AppSubTabsMstType = Instance<typeof AppSubTabsMstEnum>;