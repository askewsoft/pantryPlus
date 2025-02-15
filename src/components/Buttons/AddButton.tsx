import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';

import fonts from '@/consts/fonts';
import { iconStyleStyle, iconStyle } from '@/consts/iconButtons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const AddButton = ({onPress, foreground, background, materialIconName}: {onPress: () => void, foreground: string, background: string, materialIconName: MaterialIconName}) => {
  return (
    <MaterialIcons.Button
      name={materialIconName}
      size={fonts.topNavIconSize}
      color={foreground}
      backgroundColor={background}
      borderRadius={0}
      iconStyle={iconStyleStyle}
      style={iconStyle}
      underlayColor={background}
      onPress={onPress}
    />
  )
}

export default observer(AddButton);