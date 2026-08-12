import colors from "./colors";
import { StackNavigationOptions } from '@react-navigation/stack';

const stackNavScreenOptions: StackNavigationOptions = {
    headerStyle: {
      height: 40,
      backgroundColor: colors.brandColor,
    },
    // App shell already applies top safe-area inset; do not also offset header content
    // or the fixed 40px header clips the hamburger / title under the status bar.
    headerStatusBarHeight: 0,
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: 'bold' },
    headerShown: true
  }

export default stackNavScreenOptions
