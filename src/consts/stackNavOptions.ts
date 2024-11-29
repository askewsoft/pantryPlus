import colors from "./colors";
import { StackNavigationOptions } from '@react-navigation/stack';

const stackNavScreenOptions: StackNavigationOptions = {
    headerStyle: {
      height: 40,
      backgroundColor: colors.brandColor,
    },
    headerTitleAlign: 'left',
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: 'bold' },
    headerShown: true
  }

export default stackNavScreenOptions