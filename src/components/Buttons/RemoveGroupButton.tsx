import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import logging from '@/config/logging';

const RemoveGroupButton = ({ groupId }: { groupId: string }) => {
    const onPressDelete = () => {
        logging.debug ? alert(`delete group: ${groupId}`) : null;
        // TODO: remove group
    }
    return (
        <MaterialIcons.Button
            name="delete"
            size={fonts.rowIconSize}
            backgroundColor={'transparent'}
            color={colors.brandColor}
            iconStyle={{ padding: 0, margin: 0 }}
            style={{ alignSelf: 'flex-end', height: '95%' }}
            onLongPress={onPressDelete}
        />
    );
}

export default observer(RemoveGroupButton);