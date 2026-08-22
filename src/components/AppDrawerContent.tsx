import React from 'react';
import { StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import { clearIntentSessionAndCache } from '@/services/intentSync';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const AppDrawerContent = (props: DrawerContentComponentProps) => {
  const { signOut } = useAuthenticator();

  const logout = () => {
    props.navigation.closeDrawer();
    void clearIntentSessionAndCache();
    domainStore.initialize();
    uiStore.initialize();
    signOut();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.content}
    >
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log Out"
        icon={({ color, size }) => (
          <MaterialIcons name="logout" size={size} color={color} />
        )}
        onPress={logout}
        inactiveTintColor={colors.brandColor}
        activeTintColor={colors.white}
        inactiveBackgroundColor="transparent"
        activeBackgroundColor={colors.lightBrandColor}
        labelStyle={styles.label}
        style={styles.item}
        accessibilityLabel="Log Out"
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 12,
    flexGrow: 1,
  },
  label: {
    fontSize: fonts.messageTextSize,
    fontWeight: '600',
  },
  item: {
    borderRadius: 8,
  },
});

export default observer(AppDrawerContent);
