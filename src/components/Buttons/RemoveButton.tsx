import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { iconSize } from '@/consts/iconButtons';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

const RemoveButton = ({ onPress }: { onPress: FnReturnVoid }) => {
    const onPressDelete = () => {
        onPress();
    }
    return (
        <MaterialIcons.Button
            name="delete"
            size={iconSize.rowIconSize}
            backgroundColor={'transparent'}
            color={colors.brandColor}
            iconStyle={{ padding: 0, margin: 0 }}
            style={{ alignSelf: 'flex-end', height: '95%', padding: 0, margin: 0 }}
            underlayColor={colors.itemBackground}
            onLongPress={onPressDelete}
        />
    );
}

export default observer(RemoveButton);