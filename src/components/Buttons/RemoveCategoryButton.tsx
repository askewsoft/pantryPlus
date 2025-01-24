import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import logging from '@/config/logging';
import { domainStore } from '@/stores/DomainStore';

const RemoveCategoryButton = ({ categoryId, listId }: { categoryId: string, listId: string }) => {
    const onPressDelete = () => {
        const xAuthUser = domainStore.user?.email!;
        const currList = domainStore.lists.find(l => l.id === listId);
        currList?.removeCategory({ categoryId, xAuthUser });
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

export default observer(RemoveCategoryButton);