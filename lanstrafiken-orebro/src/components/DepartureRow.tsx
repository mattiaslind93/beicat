import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Departure } from '@/api/resrobot';
import { LinePill } from '@/components/LinePill';
import { useT } from '@/i18n';
import { colors, spacing } from '@/theme';
import { delayMinutes, formatClock, minutesUntil } from '@/utils/time';

/**
 * En rad på avgångstavlan: linje, destination, läge samt nedräkning.
 * Realtid visas i grönt, förseningar i orange med struken tidtabellstid,
 * inställda avgångar i rött — samma mönster som SL-appen.
 */
export function DepartureRow({ departure }: { departure: Departure }) {
  const t = useT();
  const best = departure.realtime ?? departure.scheduled;
  const delay = delayMinutes(departure.scheduled, departure.realtime);
  const mins = minutesUntil(best);
  const countdown = mins === 0 ? t.common.now : `${mins} ${t.common.minShort}`;

  return (
    <View style={styles.row}>
      <LinePill line={departure.line} />
      <View style={styles.middle}>
        <Text style={styles.direction} numberOfLines={1}>
          {departure.direction}
        </Text>
        <View style={styles.subRow}>
          {departure.track ? (
            <Text style={styles.track}>
              {t.common.track} {departure.track}
            </Text>
          ) : null}
          {departure.cancelled ? (
            <Text style={styles.cancelled}>{t.common.cancelled}</Text>
          ) : delay > 0 ? (
            <Text style={styles.delayed}>
              <Text style={styles.struck}>{formatClock(departure.scheduled)}</Text>{' '}
              {formatClock(best)} (+{delay})
            </Text>
          ) : (
            <Text style={departure.realtime ? styles.realtime : styles.scheduled}>
              {formatClock(best)}
            </Text>
          )}
        </View>
      </View>
      {!departure.cancelled && (
        <Text style={[styles.countdown, departure.realtime && styles.countdownRealtime]}>
          {countdown}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  middle: { flex: 1 },
  direction: { fontSize: 16, color: colors.text, fontWeight: '500' },
  subRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  track: { fontSize: 13, color: colors.textSecondary },
  scheduled: { fontSize: 13, color: colors.textSecondary },
  realtime: { fontSize: 13, color: colors.realtime },
  delayed: { fontSize: 13, color: colors.warning },
  struck: { textDecorationLine: 'line-through', color: colors.textSecondary },
  cancelled: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  countdown: { fontSize: 17, fontWeight: '700', color: colors.text, minWidth: 52, textAlign: 'right' },
  countdownRealtime: { color: colors.realtime },
});
