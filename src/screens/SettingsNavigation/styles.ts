import { StyleSheet } from 'react-native';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 20,
    marginHorizontal: 10,
  },
  propertyContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
    marginHorizontal: 5,
  },
  label: {
    flex: 1,
    fontSize: fonts.messageTextSize,
    fontWeight: 'bold',
    color: colors.brandColor,
    verticalAlign: 'middle',
  },
  value: {
    flex: 2,
    fontSize: fonts.badgeTextSize,
    color: colors.brandColor,
    backgroundColor: colors.detailsBackground,
    verticalAlign: 'middle',
    marginHorizontal: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.inactiveButtonColor,
    borderRadius: 5,
  },
  switch: {
    flex: 0,
    marginHorizontal: 30,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    alignSelf: 'flex-start',
  }
});