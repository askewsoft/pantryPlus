import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cast, Instance, t } from 'mobx-state-tree';
import { persist } from 'mst-persist';
import { Tooltip } from '@/consts/Tooltip';

const OpenCategory = t.model('OpenCategory', {
    id: t.identifier,
    open: t.boolean,
});

export const UIStoreModel = t.model('UIStoreModel', {
    addCategoryModalVisible: false,
    addGroupModalVisible: false,
    addItemToCategoryID: t.maybeNull(t.string),
    addItemToListID: t.maybeNull(t.string),
    addListModalVisible: false,
    addLocationModalVisible: false,
    groupsLoaded: false,
    lastScreen: t.optional(t.enumeration('lastScreen', ['IntroScreen', 'WelcomeScreen', 'MyLists']), 'IntroScreen'),
    lastUsedVersion: t.optional(t.string, '1.0.0'),
    listsLoaded: false,
    locationsLoaded: false,
    openCategories: t.map(OpenCategory),
    purchaseHistoryLookbackDays: t.optional(t.number, 90),
    selectedLocation: t.maybeNull(t.string),
    selectedShoppingList: t.maybeNull(t.string),
    selectedTooltip: t.maybeNull(t.enumeration('selectedTooltip', [...Object.values(Tooltip)])),
    shareModalVisible: false,
    showIntroScreen: false,
    signInOrUp: t.optional(t.enumeration('signInOrUp', ['signIn', 'signUp']), 'signIn'),
})
.actions(self => ({
    initialize: () => {
        // self.lastUsedVersion = '1.0.0'; // intentionally not resetting this
        self.addCategoryModalVisible = false;
        self.addGroupModalVisible = false;
        self.addItemToCategoryID = null;
        self.addItemToListID = null;
        self.addListModalVisible = false;
        self.addLocationModalVisible = false;
        self.groupsLoaded = false;
        self.lastScreen = 'IntroScreen';
        self.listsLoaded = false;
        self.locationsLoaded = false;
        self.openCategories.clear();
        self.purchaseHistoryLookbackDays = 90;
        self.selectedLocation = null;
        self.selectedShoppingList = null;
        self.selectedTooltip = null;
        self.shareModalVisible = false;
        self.showIntroScreen = false;
        self.signInOrUp = 'signIn';
    },
    setSignInOrUp(signInOrUp: 'signIn' | 'signUp') {
        self.signInOrUp = cast(signInOrUp);
    },
    setShowIntroScreen(showIntroScreen: boolean) {
        self.showIntroScreen = showIntroScreen;
    },
    setLastScreen(lastScreen: 'IntroScreen' | 'WelcomeScreen' | 'MyLists') {
        self.lastScreen = cast(lastScreen);
    },
    setLastUsedVersion(lastUsedVersion: string) {
        self.lastUsedVersion = cast(lastUsedVersion);
    },
    setListsLoaded(listsLoaded: boolean) {
        self.listsLoaded = listsLoaded;
    },
    setLocationsLoaded(locationsLoaded: boolean) {
        self.locationsLoaded = locationsLoaded;
    },
    setGroupsLoaded(groupsLoaded: boolean) {
        self.groupsLoaded = groupsLoaded;
    },
    setAddListModalVisible(addListModalVisible: boolean) {
        self.addListModalVisible = addListModalVisible;
    },
    setSelectedShoppingList(selectedShoppingList: string | null) {
        self.selectedShoppingList = cast(selectedShoppingList);
    },
    setSelectedLocation(selectedLocation: string | null) {
        self.selectedLocation = cast(selectedLocation);
    },
    setSelectedTooltip(selectedTooltip: Tooltip | null) {
        self.selectedTooltip = cast(selectedTooltip);
    },
    setAddCategoryModalVisible(addCategoryModalVisible: boolean) {
        self.addCategoryModalVisible = addCategoryModalVisible;
    },
    setAddGroupModalVisible(addGroupModalVisible: boolean) {
        self.addGroupModalVisible = addGroupModalVisible;
    },
    setAddLocationModalVisible(addLocationModalVisible: boolean) {
        self.addLocationModalVisible = addLocationModalVisible;
    },
    setOpenCategory(categoryId: string, open: boolean) {
        self.openCategories.put({ id: categoryId, open });
    },
    setAddItemToCategoryID(categoryID: string | null) {
        self.addItemToCategoryID = categoryID;
    },
    setAddItemToListID(listID: string) {
        self.addItemToListID = listID;
    },
    setShareModalVisible(shareModalVisible: boolean) {
        self.shareModalVisible = shareModalVisible;
    },
    setPurchaseHistoryLookbackDays(purchaseHistoryLookbackDays: number) {
        self.purchaseHistoryLookbackDays = purchaseHistoryLookbackDays;
    }
}));

type UIStoreType = Instance<typeof UIStoreModel>;

export const uiStore = UIStoreModel.create();

// saves to and loads from device storage
persist('pantryPlusUI', uiStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: [
        'addGroupModalVisible',
        'addItemToCategoryID',
        'addItemToListID',
        'addLocationModalVisible',
        'groupsLoaded',
        'listsLoaded',
        'locationsLoaded',
        'selectedLocation',
        'selectedShoppingList',
        'shareModalVisible',
        'selectedTooltip',
    ]
});

export const UIStoreContext = createContext<UIStoreType | null>(null);
export const UIStoreContextProvider = UIStoreContext.Provider;