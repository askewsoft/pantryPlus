import { observer } from 'mobx-react-lite';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

// TODO: Add check box functionality
const CheckBoxButton = () => {
  return (
    <MaterialIcons.Button
      name="check-box-outline-blank"
      size={fonts.rowIconSize}
      backgroundColor={colors.itemBackground}
      color={colors.brandColor}
      iconStyle={{ padding: 0, margin: 0 }}
      underlayColor={colors.lightBrandColor}
      onPress={() => {
      }}
    />
  );
};

export default observer(CheckBoxButton);