import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Attribution } from '@/components/Attribution';
import { EmptyState, ErrorState, Loading } from '@/components/ScreenState';
import { config } from '@/config';
import { useServiceAlerts } from '@/hooks/queries';
import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/time';

/**
 * Aktiva störningar i Örebro län från GTFS-RT ServiceAlerts.
 * (Störningar visas dessutom inline i avgångar och reseförslag —
 * den här vyn är totalöversikten.)
 */
export function DisruptionsScreen() {
  const t = useT();
  const language = useSettings((s) => s.language);
  const locale = language === 'sv' ? 'sv-SE' : 'en-GB';
  const { data, isLoading, isError, refetch } = useServiceAlerts();

  if (config.gtfsRtKey.length === 0) {
    return <EmptyState message={t.common.noApiKey} />;
  }
  if (isLoading) return <Loading />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const alerts = data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t.disruptions.empty} />}
        contentContainerStyle={alerts.length === 0 ? styles.emptyContent : styles.list}
        onRefresh={refetch}
        refreshing={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.header}>{item.header || '—'}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
            {item.activeFrom ? (
              <Text style={styles.period}>
                {t.disruptions.activeSince} {formatDateTime(item.activeFrom, locale)}
                {item.activeTo
                  ? ` ${t.disruptions.until} ${formatDateTime(item.activeTo, locale)}`
                  : ''}
              </Text>
            ) : null}
          </View>
        )}
        ListFooterComponent={<Attribution />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  emptyContent: { flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: { fontSize: 16, fontWeight: '700', color: colors.text },
  description: { fontSize: 14, color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  period: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
});
