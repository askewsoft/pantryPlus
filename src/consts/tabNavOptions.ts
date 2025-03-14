import { domainStore } from "@/stores/DomainStore";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

import colors from "./colors";

// Shared tab options
const tabOptions = ({iconName}: {iconName: string}): BottomTabNavigationOptions => {
    const numInvites = domainStore.user?.numInvites || 0;
    return {
      tabBarShowLabel: true,
      tabBarLabelPosition: 'below-icon',
      tabBarLabelStyle: { fontWeight: 'bold', fontSize: 14 },
      tabBarActiveTintColor: colors.white,
      tabBarInactiveTintColor: colors.inactiveButtonColor,
      tabBarInactiveBackgroundColor: colors.brandColor,
      tabBarStyle: { backgroundColor: colors.brandColor, height: 90, paddingBottom: 20, paddingTop: 10 },
      tabBarItemStyle: { borderRadius: 5, backgroundColor: colors.lightBrandColor },
      tabBarPosition: 'bottom',
      tabBarBadge: iconName === 'groups' && numInvites > 0 ? numInvites : undefined,
      tabBarBadgeStyle: { color: colors.white, backgroundColor: colors.alertColor },
    }
  };
  
  export default tabOptions;