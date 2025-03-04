import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { domainStore } from '@/stores/DomainStore';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';
import { iconSize } from '@/consts/iconButtons';

const CurrentLocation = ({onPress}: {onPress: FnReturnVoid}) => {
    const [currLocationName, setCurrLocationName] = useState('');
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const selectedKnownLocationId = domainStore.selectedKnownLocationId;
        let selectedKnownLocation: any;
        if (selectedKnownLocationId === domainStore.nearestKnownLocation?.id) {
            selectedKnownLocation = domainStore.nearestKnownLocation;
        } else {
            selectedKnownLocation = domainStore.locations.find(location => location.id === selectedKnownLocationId);
        }
        setCurrLocationName(selectedKnownLocation?.name ?? 'unknown');
    }, [domainStore.selectedKnownLocationId]);

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: colors.lightBrandColor,
            paddingHorizontal: 5,
            paddingVertical: 3,
        },
        pressable: {
            flexDirection: 'row',
        },
        textHeading: {
            fontSize: fonts.infoTextSize,
            color: colors.white,
            fontStyle: 'italic',
        },
        text: {
            fontSize: fonts.infoTextSize,
            color: colors.white,
            fontStyle: 'italic',
            fontWeight: isPressed ? 'bold' : 'normal',
            marginLeft: 10,
            paddingHorizontal: 5,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.textHeading}>Selected Location: </Text>
            <Pressable style={styles.pressable} onPress={onPress} onPressIn={() => setIsPressed(true)} onPressOut={() => setIsPressed(false)}>
                <Text style={styles.text}>{currLocationName}</Text>
                <MaterialIcons name="edit" size={iconSize.infoIconSize} color="white" />
            </Pressable>
        </View>
    )
}
export default observer(CurrentLocation);