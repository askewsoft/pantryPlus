import { cast, Instance, t } from 'mobx-state-tree';
import { createContext } from 'react';

export const UIStoreModel = t.model('UIStoreModel', {
    showIntroScreen: false,
    lastScreen: t.enumeration('lastScreen', ['IntroScreen', 'WelcomeMessage']),
    lastUsedVersion: t.string,
    signInOrUp: t.enumeration('signInOrUp', ['signIn', 'signUp']),
})
.actions(self => ({
    setSignInOrUp(signInOrUp: 'signIn' | 'signUp') {
        self.signInOrUp = cast(signInOrUp);
    },
}));

type UIStoreType = Instance<typeof UIStoreModel>;

export const uiStore = UIStoreModel.create({
    lastScreen: 'IntroScreen',
    lastUsedVersion: '1.0.0',
    signInOrUp: 'signUp',
});
export const UIStoreContext = createContext<UIStoreType | null>(null);
export const UIStoreContextProvider = UIStoreContext.Provider;