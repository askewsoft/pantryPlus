import { createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cast, Instance, t } from 'mobx-state-tree';
import { persist } from 'mst-persist';

export const UIStoreModel = t.model('UIStoreModel', {
    showIntroScreen: false,
    lastScreen: t.enumeration('lastScreen', ['IntroScreen', 'WelcomeScreen', 'MyLists']),
    lastUsedVersion: t.string,
    signInOrUp: t.enumeration('signInOrUp', ['signIn', 'signUp']),
    selectedShoppingList: t.maybeNull(t.string),
    addListModalVisible: false,
    addCategoryModalVisible: false,
})
.actions(self => ({
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
    setAddListModalVisible(addListModalVisible: boolean) {
        self.addListModalVisible = addListModalVisible;
    },
    setSelectedShoppingList(selectedShoppingList: string) {
        self.selectedShoppingList = cast(selectedShoppingList);
    },
    setAddCategoryModalVisible(addCategoryModalVisible: boolean) {
        self.addCategoryModalVisible = addCategoryModalVisible;
    }
}));

type UIStoreType = Instance<typeof UIStoreModel>;

export const uiStore = UIStoreModel.create({
    lastScreen: 'IntroScreen',
    lastUsedVersion: '1.0.0',
    signInOrUp: 'signIn',
    addListModalVisible: false,
    selectedShoppingList: null,
    addCategoryModalVisible: false,
});

// saves to and loads from device storage
persist('pantryPlusUI', uiStore, {
    storage: AsyncStorage,
    jsonify: true
});

export const UIStoreContext = createContext<UIStoreType | null>(null);
export const UIStoreContextProvider = UIStoreContext.Provider;