import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cast, Instance, t } from 'mobx-state-tree';
import { persist } from 'mst-persist';

const OpenCategory = t.model('OpenCategory', {
    id: t.identifier,
    open: t.boolean,
});

export const UIStoreModel = t.model('UIStoreModel', {
    showIntroScreen: false,
    lastScreen: t.optional(t.enumeration('lastScreen', ['IntroScreen', 'WelcomeScreen', 'MyLists']), 'IntroScreen'),
    lastUsedVersion: t.optional(t.string, '1.0.0'),
    signInOrUp: t.optional(t.enumeration('signInOrUp', ['signIn', 'signUp']), 'signIn'),
    listsLoaded: false,
    groupsLoaded: false,
    selectedShoppingList: t.maybeNull(t.string),
    addListModalVisible: false,
    addCategoryModalVisible: false,
    addGroupModalVisible: false,
    openCategories: t.map(OpenCategory),
    addItemToCategoryID: t.maybeNull(t.string),
    addItemToListID: t.maybeNull(t.string),
    shareModalVisible: false,
})
.actions(self => ({
    initialize: () => {
        self.showIntroScreen = false;
        self.lastScreen = 'IntroScreen';
        // self.lastUsedVersion = '1.0.0'; // intentionally not resetting this
        self.signInOrUp = 'signIn';
        self.listsLoaded = false;
        self.groupsLoaded = false;
        self.selectedShoppingList = null;
        self.addListModalVisible = false;
        self.addCategoryModalVisible = false;
        self.addGroupModalVisible = false;
        self.openCategories.clear();
        self.addItemToCategoryID = null;
        self.addItemToListID = null;
        self.shareModalVisible = false;
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
    setGroupsLoaded(groupsLoaded: boolean) {
        self.groupsLoaded = groupsLoaded;
    },
    setAddListModalVisible(addListModalVisible: boolean) {
        self.addListModalVisible = addListModalVisible;
    },
    setSelectedShoppingList(selectedShoppingList: string | null) {
        self.selectedShoppingList = cast(selectedShoppingList);
    },
    setAddCategoryModalVisible(addCategoryModalVisible: boolean) {
        self.addCategoryModalVisible = addCategoryModalVisible;
    },
    setAddGroupModalVisible(addGroupModalVisible: boolean) {
        self.addGroupModalVisible = addGroupModalVisible;
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
    }
}));

type UIStoreType = Instance<typeof UIStoreModel>;

export const uiStore = UIStoreModel.create();

// saves to and loads from device storage
persist('pantryPlusUI', uiStore, {
    storage: AsyncStorage,
    jsonify: true,
    blacklist: ['addItemToCategoryID', 'addItemToListID', 'addGroupModalVisible', 'listsLoaded', 'groupsLoaded', 'shareModalVisible']
});

export const UIStoreContext = createContext<UIStoreType | null>(null);
export const UIStoreContextProvider = UIStoreContext.Provider;