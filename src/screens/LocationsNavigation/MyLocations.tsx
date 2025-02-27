import { View, RefreshControl, Button, Text, StyleSheet, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem from "react-native-swipeable-item";

import { StackPropsMyLocations } from '@/types/LocationNavTypes';
import { FnReturnVoid } from '@/types/FunctionArgumentTypes';

import { domainStore, LocationType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';


import AddLocationModal from './modals/AddLocationModal';
import LocationElement from '@/components/LocationElement';

const MyLocations = ({navigation}: StackPropsMyLocations) => {
  const renderLocationElement = (navigation: any) => {
    return ({ item, drag }: { item: LocationType, drag: FnReturnVoid }) => {
      return (
        <ScaleDecorator activeScale={1.04}>
          <SwipeableItem
            item={item}
            overSwipe={20}
            snapPointsLeft={[70]}
          >
            <LocationElement id={item.id} navigation={navigation} />
          </SwipeableItem>
        </ScaleDecorator>
      );
    }
  }

  const onRefresh = async () => {
    uiStore.setLocationsLoaded(false);
    await domainStore.loadRecentLocations();
    uiStore.setLocationsLoaded(true);
  }

  return (
    <View style={styles.container}>
      <Pressable onLongPress={onRefresh}>
        <Text style={styles.title}>Locations of past purchases</Text>
      </Pressable>
      <DraggableFlatList
        data={toJS(domainStore.locations)}
        renderItem={renderLocationElement(navigation)}
        keyExtractor={location => location.id}
        refreshControl={<RefreshControl refreshing={!uiStore.locationsLoaded} onRefresh={onRefresh} />}
      />
      {domainStore.locations?.length === 0 && (
        <Button title="Reload Locations" onPress={() => domainStore.loadRecentLocations()} />
      )}
        <AddLocationModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: fonts.messageTextSize,
    color: colors.lightBrandColor,
    margin: 10,
  },
});


export default observer(MyLocations);