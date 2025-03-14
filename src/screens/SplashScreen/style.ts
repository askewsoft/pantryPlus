import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#841584',
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 'auto',
    padding: '10%',
    justifyContent: 'center'
  },
  welcomeText: {
    color: 'white',
    fontSize: 30,
    padding: '0%'
  },
  pantryLogo: {
    color: 'white',
    fontSize: 60,
    padding: '0%'
  },
  plusLogo: {
    fontSize: 80,
    padding: '0%',
    color: 'white'
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