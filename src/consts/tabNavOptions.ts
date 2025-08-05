import { domainStore } from "@/stores/DomainStore";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

import colors from "./colors";

// Shared tab options
const tabOptions = ({tabName, iconName}: {tabName: string, iconName: string}): BottomTabNavigationOptions => {
    const numInvites = domainStore.user?.numInvites || 0;
    
    return {
      tabBarShowLabel: true,
      tabBarLabelPosition: 'below-icon',
      tabBarLabelStyle: { fontWeight: 'bold', fontSize: 14 },
      tabBarActiveTintColor: colors.white,
      tabBarInactiveTintColor: colors.inactiveButtonColor,
      tabBarInactiveBackgroundColor: colors.brandColor,
      tabBarStyle: { backgroundColor: colors.brandColor, paddingHorizontal: 10 },
      tabBarItemStyle: { paddingTop: 5 },
      tabBarBadge: iconName === 'groups' && numInvites > 0 ? numInvites : undefined,
      tabBarBadgeStyle: { color: colors.white, backgroundColor: colors.alertColor },
      tabBarAccessibilityLabel: tabName
    }
  };
  
  export default tabOptions;