import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { observer } from 'mobx-react';
import { MaterialIcons } from '@expo/vector-icons';

import colors from '@/consts/colors';
import fonts from '@/consts/fonts';
import { uiStore } from '@/stores/UIStore';
import { Tooltip, tooltipNotes } from '@/consts/Tooltip';

const InfoButton = ({ tooltipId }: { tooltipId: Tooltip }) => {
  const displayTooltip = () => {
    if (uiStore.selectedTooltip === tooltipId) {
      uiStore.setSelectedTooltip(null);
    } else {
      uiStore.setSelectedTooltip(tooltipId);
    }
  };

  const styles = StyleSheet.create({
    tooltip: {
      position: 'absolute',
      top: -15,
      left: 30,
      width: Dimensions.get('window').width * .75,
      height: 'auto',
      backgroundColor: colors.lightBrandColor,
      padding: 10,
      borderRadius: 5,
      zIndex: 999999,
      elevation: 999999, // Android only
    },
    container: {
      position: 'relative',
      zIndex: 9999,
    },
    tooltipText: {
      color: colors.white,
      fontSize: fonts.infoTextSize,
      fontStyle: 'italic',
    },
    closeButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      padding: 0,
      margin: 0,
      zIndex: 999999,
    },
  });

  return (
    <View style={styles.container}>
      <MaterialIcons.Button
        name="info-outline"
        size={fonts.badgeTextSize}
        color={colors.brandColor}
        backgroundColor={colors.detailsBackground}
        style={{ padding: 0 }}
        onPress={displayTooltip}
      /> 
      {uiStore.selectedTooltip === tooltipId && (
        <Pressable style={styles.tooltip} onPress={() => uiStore.setSelectedTooltip(null)}>
          <MaterialIcons
            name="close"
            size={fonts.infoTextSize}
            color={colors.white}
            style={styles.closeButton}
          />
          <Text style={styles.tooltipText}>{tooltipNotes[tooltipId]}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default observer(InfoButton);