import React from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

const CurrentLocation = ({onPress}: {onPress: FnReturnVoid}) => {
    const nearestKnownLocationId = domainStore.nearestKnownLocationId;
    const nearestKnownLocation = domainStore.locations.find(location => location.id === nearestKnownLocationId);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Nearest Location: </Text>
            <Pressable style={styles.pressable} onPress={onPress}>
                <Text style={styles.text}>{nearestKnownLocation?.name ?? 'unknown'}</Text>
                <MaterialIcons name="edit" size={iconSize.infoIconSize} color="white" />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: colors.lightBrandColor,
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
    pressable: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: fonts.infoTextSize,
        color: colors.white,
        fontStyle: 'italic',
        paddingHorizontal: 15,
    },
});
export default observer(CurrentLocation);