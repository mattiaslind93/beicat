import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { StopLocation } from '@/api/resrobot';
import { StopSearchField } from '@/components/StopSearchField';
import { isConfigured } from '@/config';
import { MissingApiKey } from '@/components/ScreenState';
import { useT } from '@/i18n';
import type { DeparturesStackParamList } from '@/navigation/types';
import { useFavorites } from '@/state/favorites';
import { colors, radius, spacing } from '@/theme';

/**
 * Ingång till avgångstavlor: sök hållplats eller välj bland favoriter.
 */
export function DeparturesScreen() {
  const t = useT();
  const navigation =
    useNavigation<NativeStackNavigationProp<DeparturesStackParamList>>();
  const favorites = useFavorites((s) => s.stops);

  if (!isConfigured()) return <MissingApiKey />;

  const open = (stop: StopLocation) => navigation.navigate('StopDetail', { stop });

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <StopSearchField
          placeholder={t.common.searchStop}
          value={null}
          onSelect={(stop) => stop && open(stop)}
          stopsOnly
        />
      </View>

      <Text style={styles.heading}>{t.common.favorites}</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.extId}
        ListEmptyComponent={<Text style={styles.empty}>{t.common.noFavorites}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.favorite} onPress={() => open(item)}>
            <Text style={styles.favoriteStar}>★</Text>
            <Text style={styles.favoriteName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { padding: spacing.lg, zIndex: 10 },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.textSecondary, marginHorizontal: spacing.lg, fontSize: 14 },
  favorite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteStar: { color: colors.accent, fontSize: 18 },
  favoriteName: { fontSize: 16, color: colors.text, fontWeight: '500' },
});
