import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';

import { iconSize } from '@/consts/iconButtons';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const AddButton = ({onPress, label, foreground, background, materialIconName}: {onPress: FnReturnVoid, label: string, foreground: string, background: string, materialIconName: MaterialIconName}) => {
  return (
    <MaterialIcons.Button
      name={materialIconName}
      size={iconSize.topNavIconSize}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      underlayColor={background}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    />
  )
}

export default observer(AddButton);