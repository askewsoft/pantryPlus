import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import logging from '@/config/logging';

const RemoveCategoryButton = ({ categoryId, listId }: { categoryId: string, listId: string }) => {
    const onPressDelete = () => {
        logging.debug ? alert(`delete category: ${categoryId}, from list: ${listId}`) : null;
        // TODO: remove category from list
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

export default observer(RemoveCategoryButton);