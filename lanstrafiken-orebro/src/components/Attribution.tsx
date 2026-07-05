import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useT } from '@/i18n';
import { colors, spacing } from '@/theme';

/** Obligatorisk CC-BY-attribution för Trafiklab-data. */
export function Attribution() {
  const t = useT();
  return <Text style={styles.text}>{t.common.attribution}</Text>;
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    paddingVertical: spacing.sm,
  },
});
