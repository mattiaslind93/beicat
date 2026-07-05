import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Trip } from '@/api/resrobot';
import { LinePill } from '@/components/LinePill';
import { useT } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { delayMinutes, formatClock } from '@/utils/time';

/**
 * Ett reseförslag: tidsspann, restid, byten och varje ben med
 * realtid/förseningar inline (störningar där de är relevanta, inte i egen flik).
 */
export function TripCard({ trip }: { trip: Trip }) {
  const t = useT();
  const transferLabel =
    trip.transferCount === 1 ? t.trip.change : t.trip.changes;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.timeSpan}>
          {formatClock(trip.departure)} – {formatClock(trip.arrival)}
        </Text>
        <Text style={styles.meta}>
          {trip.durationMinutes} {t.common.minShort}
          {trip.transferCount > 0 ? ` · ${trip.transferCount} ${transferLabel}` : ''}
        </Text>
      </View>

      {trip.legs.map((leg, i) => {
        const depDelay = delayMinutes(leg.departure, leg.realtimeDeparture);
        return (
          <View key={i} style={styles.leg}>
            {leg.kind === 'walk' ? (
              <Text style={styles.walk}>
                🚶 {t.trip.walk}
                {leg.distanceMeters ? ` ${leg.distanceMeters} m` : ''}
              </Text>
            ) : (
              <View style={styles.transitLeg}>
                <View style={styles.legHeader}>
                  <LinePill line={leg.line ?? '?'} />
                  {leg.direction ? (
                    <Text style={styles.direction} numberOfLines={1}>
                      {t.departures.towards} {leg.direction}
                    </Text>
                  ) : null}
                  {leg.cancelled ? (
                    <Text style={styles.cancelled}>{t.common.cancelled}</Text>
                  ) : depDelay > 0 ? (
                    <Text style={styles.delayed}>+{depDelay} {t.common.minShort}</Text>
                  ) : null}
                </View>
                <Text style={styles.stopLine}>
                  {formatClock(leg.realtimeDeparture ?? leg.departure)}  {leg.originName}
                  {leg.originTrack ? `  (${t.common.track} ${leg.originTrack})` : ''}
                </Text>
                <Text style={styles.stopLine}>
                  {formatClock(leg.realtimeArrival ?? leg.arrival)}  {leg.destName}
                  {leg.destTrack ? `  (${t.common.track} ${leg.destTrack})` : ''}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  timeSpan: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary },
  leg: { marginTop: spacing.sm },
  walk: { fontSize: 14, color: colors.textSecondary },
  transitLeg: { gap: 2 },
  legHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  direction: { flex: 1, fontSize: 14, color: colors.text },
  delayed: { fontSize: 13, color: colors.warning, fontWeight: '600' },
  cancelled: { fontSize: 13, color: colors.danger, fontWeight: '700' },
  stopLine: { fontSize: 14, color: colors.text, marginLeft: 2 },
});
