import { useEffect } from 'react';
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

const MyLocations = ({navigation, route}: {navigation: any, route: any}) => {
  const returnToList = route.params?.returnToList;

  useEffect(() => {
    navigation.addListener('focus', () => {
      if (uiStore.recentLocationsNeedRefresh) {
        domainStore.loadRecentLocations();
        uiStore.setRecentLocationsNeedRefresh(false);
      }
    });
  }, []);

  const renderLocationElement = (navigation: any) => {
    return ({ item: location }: { item: LocationType }) => {
      return (
        <LocationElement id={location.id} navigation={navigation} returnToList={returnToList} />
      );
    }
  }

  const onRefresh = async () => {
    uiStore.setLocationsLoaded(false);
    await domainStore.loadRecentLocations();
    uiStore.setLocationsLoaded(true);
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <LocationElement id={domainStore.nearestKnownLocation?.id ?? ''} navigation={navigation} returnToList={returnToList}/>
        <Text style={styles.title}>Locations of past purchases</Text>
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
    </ErrorBoundary>
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
    fontSize: fonts.infoTextSize,
    color: colors.lightBrandColor,
    marginTop: 5,
  },
});

export default observer(MyLocations);