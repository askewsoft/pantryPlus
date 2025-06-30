import { StyleSheet } from 'react-native';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.white,
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 'auto',
    padding: '10%',
    justifyContent: 'center'
  },
  logoContainer: {
    marginTop: 50,
    flex: 1
  },
  pantryLogo: {
    color: colors.brandColor,
    fontSize: fonts.modalTitleSize * 2,
    fontWeight: 'bold',
    padding: 20
  },
  introContainer: {
    display: 'flex',
    flex: 3,
    flexDirection: 'column',
  },
  introTextContainer: {
    padding: 10,
    flex: 4,
  },
  introText: {
    color: colors.brandColor,
    fontSize: fonts.modalTitleSize,
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    margin: 0,
  },
  carouselControlsContainer: {
    flex: 1,
    alignItems: 'center',
  }
});
