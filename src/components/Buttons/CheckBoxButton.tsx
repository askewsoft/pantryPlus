import { observer } from 'mobx-react-lite';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';

import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const CheckBoxButton = ({ isChecked, onPress }: { isChecked: boolean, onPress: FnReturnVoid }) => {
  return (
    <MaterialIcons.Button
      name={isChecked ? "check-circle-outline" : "radio-button-unchecked"}
      size={iconSize.rowIconSize}
      backgroundColor={colors.itemBackground}
      color={colors.brandColor}
      iconStyle={{ padding: 0, margin: 0 }}
      underlayColor={colors.lightBrandColor}
      onPress={onPress}
    />
  );
};

export default observer(CheckBoxButton);