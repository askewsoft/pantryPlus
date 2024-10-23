import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 'auto',
    padding: '10%',
    justifyContent: 'center'
  },
  pantryLogo: {
    color: '#841584',
    fontSize: 60,
    padding: 20
  },
  plusLogo: {
    fontSize: 80,
    padding: '0%',
    color: '#841584'
  },
  logoContainer: {
    marginTop: 100,
    flex: 1
  },
  introContainer: {
    display: 'flex',
    flex: 3,
    flexDirection: 'column',
    width: '95%'
  },
  introTextContainer: {
    padding: 10,
    flex: 4,
    borderColor: 'lightgray',
    borderWidth: 2,
    borderRadius: 10,
  },
  introText: {
    color: 'darkgray',
    fontSize: 20,
    padding: '0%',
  },
  carouselControlsContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center'
  }
});
