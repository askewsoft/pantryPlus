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
      tabBarStyle: { backgroundColor: colors.brandColor, height: 90, paddingBottom: 10, paddingTop: 10, paddingHorizontal: 10 },
      tabBarItemStyle: { marginHorizontal: 5, marginBottom: 5, paddingBottom: 5, borderRadius: 10 },
      tabBarBadge: iconName === 'groups' && numInvites > 0 ? numInvites : undefined,
      tabBarBadgeStyle: { color: colors.white, backgroundColor: colors.alertColor },
    }
  };
  
  export default tabOptions;