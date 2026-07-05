import {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  UserLocation,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StopLocation } from '@/api/resrobot';
import { Attribution } from '@/components/Attribution';
import { config } from '@/config';
import { useNearbyStops, useVehiclePositions } from '@/hooks/queries';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useT } from '@/i18n';
import type { RootTabParamList } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

/**
 * Hemskärmen enligt SL-principen: kartan först. Visar närliggande hållplatser
 * (tryck → avgångstavla) och alla bussar i länet live via GTFS-RT
 * VehiclePositions som pollas var 5:e sekund.
 */
export function MapScreen() {
  const t = useT();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { location, denied } = useUserLocation();

  const center = location ?? {
    latitude: config.defaultRegion.latitude,
    longitude: config.defaultRegion.longitude,
  };

  const { data: stops = [] } = useNearbyStops(center.latitude, center.longitude);
  const { data: vehicles = [] } = useVehiclePositions(true);

  const stopsGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: stops.map((stop) => ({
        type: 'Feature' as const,
        id: stop.extId,
        properties: { name: stop.name, stop: JSON.stringify(stop) },
        geometry: { type: 'Point' as const, coordinates: [stop.lon, stop.lat] },
      })),
    }),
    [stops],
  );

  const vehiclesGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: vehicles.map((v) => ({
        type: 'Feature' as const,
        id: v.id,
        properties: { bearing: v.bearing ?? 0 },
        geometry: { type: 'Point' as const, coordinates: [v.lon, v.lat] },
      })),
    }),
    [vehicles],
  );

  const onStopPress = (event: OnPressEvent) => {
    const raw = event.features[0]?.properties?.stop;
    if (typeof raw !== 'string') return;
    const stop = JSON.parse(raw) as StopLocation;
    navigation.navigate('DeparturesTab', {
      screen: 'StopDetail',
      params: { stop },
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} mapStyle={config.mapStyleUrl} attributionEnabled>
        <Camera
          defaultSettings={{
            centerCoordinate: [center.longitude, center.latitude],
            zoomLevel: config.defaultRegion.zoom,
          }}
        />
        {location ? <UserLocation /> : null}

        <ShapeSource id="stops" shape={stopsGeoJson} onPress={onStopPress}>
          <CircleLayer
            id="stops-circles"
            style={{
              circleRadius: 7,
              circleColor: colors.primary,
              circleStrokeWidth: 2,
              circleStrokeColor: '#fff',
            }}
          />
        </ShapeSource>

        <ShapeSource id="vehicles" shape={vehiclesGeoJson}>
          <CircleLayer
            id="vehicles-circles"
            style={{
              circleRadius: 5,
              circleColor: colors.accent,
              circleStrokeWidth: 1.5,
              circleStrokeColor: colors.primaryDark,
            }}
          />
        </ShapeSource>
      </MapView>

      {denied ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t.map.locationDenied}</Text>
        </View>
      ) : null}

      <View style={styles.legend}>
        <Text style={styles.legendText}>● {t.map.nearbyStops}</Text>
        <Text style={[styles.legendText, styles.legendVehicles]}>● {t.map.liveBuses}</Text>
        <Attribution />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  banner: {
    position: 'absolute',
    top: spacing.xl * 2,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerText: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'column',
    alignItems: 'center',
  },
  legendText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  legendVehicles: { color: colors.warning },
});
