import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
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
    color: '#841584',
    fontSize: 60,
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
    color: 'darkgray',
    fontSize: 20,
  },
  carouselControlsContainer: {
    flex: 1,
    alignItems: 'center'
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    margin: 0,
  }
});
