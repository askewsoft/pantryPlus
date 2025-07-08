import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
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
            backgroundColor="transparent"
            color={colors.brandColor}
            iconStyle={{ padding: 0, margin: 0 }}
            style={{ 
                alignSelf: 'flex-end', 
                height: '95%', 
                padding: 10, 
                margin: 0,
                justifyContent: 'center',
                alignItems: 'center'
            }}
            underlayColor={colors.itemBackground}
            onPress={onPressDelete}
        />
    );
}

export default observer(RemoveButton);