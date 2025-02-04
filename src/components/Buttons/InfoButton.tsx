import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';

const InfoButton = () => {
  return (
    <MaterialIcons.Button
        name="info-outline"
        size={fonts.badgeTextSize}
        color={colors.brandColor}
        backgroundColor={colors.detailsBackground}
        style={{ padding: 0 }}
    /> 
  );
};

export default observer(InfoButton);