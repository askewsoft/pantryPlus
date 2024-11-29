import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
// import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

import colors from '@/consts/colors';

const CategoryFolder = ({title, open, children}: {title: string, open: boolean, children: React.ReactNode}) => {
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
            <AntDesign.Button
              name={open ? "folderopen" : "folder1"}
              size={24}
              backgroundColor="white"
              color={colors.brandColor}
              iconStyle={{ padding: 0, margin: 0 }}
              onPress={() => {}}
            />
            <Text style={styles.title}>{title}</Text>
        </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: 5,
  },
  title: {
    color: colors.brandColor,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default observer(CategoryFolder);