import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DepartureRow } from '@/components/DepartureRow';
import { Attribution } from '@/components/Attribution';
import { EmptyState, ErrorState, Loading } from '@/components/ScreenState';
import { useDepartures } from '@/hooks/queries';
import { useT } from '@/i18n';
import type { DeparturesStackParamList } from '@/navigation/types';
import { useFavorites } from '@/state/favorites';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<DeparturesStackParamList, 'StopDetail'>;

/**
 * Avgångstavla för en hållplats med realtid, pollas var 30:e sekund.
 * Stjärnan i headern lägger till/tar bort hållplatsen som favorit.
 */
export function StopDetailScreen({ route, navigation }: Props) {
  const t = useT();
  const { stop } = route.params;
  const { data, isLoading, isError, refetch } = useDepartures(stop.extId);
  const isFavorite = useFavorites((s) => s.isFavorite(stop.extId));
  const toggle = useFavorites((s) => s.toggle);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: stop.name,
      headerRight: () => (
        <TouchableOpacity onPress={() => toggle(stop)} hitSlop={12}>
          <Text style={[styles.star, isFavorite && styles.starActive]}>
            {isFavorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, stop, isFavorite, toggle]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item, i) => `${item.line}-${item.scheduled.getTime()}-${i}`}
        renderItem={({ item }) => <DepartureRow departure={item} />}
        ListEmptyComponent={<EmptyState message={t.departures.empty} />}
        contentContainerStyle={(data ?? []).length === 0 ? styles.emptyContent : undefined}
        onRefresh={refetch}
        refreshing={false}
      />
      <Attribution />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContent: { flexGrow: 1 },
  star: { fontSize: 24, color: colors.textSecondary },
  starActive: { color: colors.accent },
});
