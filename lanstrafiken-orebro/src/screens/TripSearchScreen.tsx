import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { StopLocation } from '@/api/resrobot';
import { Attribution } from '@/components/Attribution';
import { EmptyState, ErrorState, Loading, MissingApiKey } from '@/components/ScreenState';
import { StopSearchField } from '@/components/StopSearchField';
import { TripCard } from '@/components/TripCard';
import { isConfigured } from '@/config';
import { useTrips, type TripQuery } from '@/hooks/queries';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useT } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

/**
 * Resesök A→B (hållplats, adress, POI eller "min position") via ResRobot,
 * med förseningar och inställda ben inline i resultaten.
 */
export function TripSearchScreen() {
  const t = useT();
  const { location } = useUserLocation();
  const [origin, setOrigin] = useState<StopLocation | null>(null);
  const [dest, setDest] = useState<StopLocation | null>(null);
  const [query, setQuery] = useState<TripQuery | null>(null);

  const myPosition: StopLocation | null = useMemo(
    () =>
      location
        ? {
            id: 'my-position',
            extId: 'my-position',
            name: t.common.myPosition,
            lat: location.latitude,
            lon: location.longitude,
            isStop: false,
          }
        : null,
    [location, t],
  );

  const { data: trips, isLoading, isError, refetch } = useTrips(query);

  if (!isConfigured()) return <MissingApiKey />;

  const canSearch = origin !== null && dest !== null;

  const swap = () => {
    setOrigin(dest);
    setDest(origin);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.fieldFrom}>
          <StopSearchField
            placeholder={t.trip.from}
            value={origin}
            onSelect={setOrigin}
            myPosition={myPosition}
          />
        </View>
        <View style={styles.fieldTo}>
          <StopSearchField placeholder={t.trip.to} value={dest} onSelect={setDest} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.swapButton} onPress={swap} accessibilityLabel={t.trip.swap}>
            <Text style={styles.swapText}>⇅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchButton, !canSearch && styles.searchButtonDisabled]}
            disabled={!canSearch}
            onPress={() => canSearch && setQuery({ origin: origin!, dest: dest! })}
          >
            <Text style={styles.searchButtonText}>{t.trip.search}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : trips ? (
        <FlatList
          data={trips}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <TripCard trip={item} />}
          ListEmptyComponent={<EmptyState message={t.trip.empty} />}
          contentContainerStyle={trips.length === 0 ? styles.emptyContent : styles.results}
          ListFooterComponent={<Attribution />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg, gap: spacing.sm, zIndex: 10 },
  fieldFrom: { zIndex: 30 },
  fieldTo: { zIndex: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  swapButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  swapText: { fontSize: 18, color: colors.primary },
  searchButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  searchButtonDisabled: { opacity: 0.4 },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  results: { paddingTop: spacing.sm },
  emptyContent: { flexGrow: 1 },
});
