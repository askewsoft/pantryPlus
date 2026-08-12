import { useEffect, useState } from 'react';
import { View, RefreshControl, Button, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { domainStore, LocationType } from '@/stores/DomainStore';
import { uiStore } from '@/stores/UIStore';
import ErrorBoundary from '@/components/ErrorBoundary';

import fonts from '@/consts/fonts';
import colors from '@/consts/colors';

import AddLocationModal from './modals/AddLocationModal';
import LocationElement from '@/components/LocationElement';
import BottomActionBar from '@/components/BottomActionBar';
import BottomActionButton from '@/components/Buttons/BottomActionButton';

const MyLocations = ({navigation, route}: {navigation: any, route: any}) => {
  const returnToList = route.params?.returnToList;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const isFirstLoad = !uiStore.locationsLoaded;
      const needsRefresh = isFirstLoad || uiStore.recentLocationsNeedRefresh;
      uiStore.setRecentLocationsNeedRefresh(false);
      if (!needsRefresh) return;
      // Avoid RefreshControl when data is already on screen — toggling it on focus
      // (e.g. ShoppingList → MyLocations) leaves a stuck content inset on iOS.
      domainStore.loadRecentLocations({ showLoading: isFirstLoad });
    });
    return unsubscribe;
  }, [navigation]);

  const renderLocationElement = (navigation: any) => {
    return ({ item: location }: { item: LocationType }) => {
      return (
        <LocationElement id={location.id} navigation={navigation} returnToList={returnToList} />
      );
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await domainStore.loadRecentLocations({ showLoading: false });
    } finally {
      setRefreshing(false);
    }
  }

  const onPressAddLocation = () => {
    uiStore.setAddLocationModalVisible(true);
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {domainStore.nearestKnownLocation && (
            <LocationElement id={domainStore.nearestKnownLocation.id} navigation={navigation} returnToList={returnToList}/>
          )}
          <Text style={styles.title}>Known locations</Text>
          <DraggableFlatList
            style={styles.draggableFlatListStyle}
            contentContainerStyle={styles.listContentContainer}
            data={toJS(domainStore.locations)}
            renderItem={renderLocationElement(navigation)}
            keyExtractor={location => location.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
          {domainStore.locations?.length === 0 && (
            <Button title="Reload Locations" onPress={() => domainStore.loadRecentLocations()} />
          )}
        </View>
        <BottomActionBar>
          <BottomActionButton
            label="Add Location"
            iconName="add-location"
            onPress={onPressAddLocation}
          />
        </BottomActionBar>
      </View>
      <AddLocationModal />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 0,
  },
  draggableFlatListStyle: {
    height: '93%',
  },
  title: {
    fontSize: fonts.infoTextSize,
    color: colors.lightBrandColor,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default observer(MyLocations);
