import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import logging from '@/config/logging';
import { domainStore } from '@/stores/DomainStore';

const RemoveListButton = ({ listId }: { listId: string }) => {
    const onPressDelete = () => {
        domainStore.removeList(listId);
    }
    return (
        <MaterialIcons.Button
            name="delete"
            size={fonts.rowIconSize}
            backgroundColor={'transparent'}
            color={colors.brandColor}
            iconStyle={{ padding: 0, margin: 0 }}
            style={{ alignSelf: 'flex-end', height: '95%' }}
            underlayColor={colors.itemBackground}
            onLongPress={onPressDelete}
        />
    );
}

export default observer(RemoveListButton);