import { StyleSheet } from 'react-native';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.brandColor,
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 'auto',
    padding: '10%',
    justifyContent: 'center'
  },
  welcomeText: {
    color: colors.white,
    fontSize: fonts.modalTitleSize,
    padding: '0%'
  },
  pantryLogo: {
    color: colors.white,
    fontSize: fonts.modalTitleSize * 2,
    padding: '0%'
  },
  plusLogo: {
    fontSize: 80,
    padding: '0%',
    color: colors.white
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'row'
  }
});