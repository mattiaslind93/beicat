import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useT } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

/** Gemensamma laddnings-/fel-/tomvyer så alla skärmar beter sig likadant. */

export function Loading() {
  const t = useT();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.secondary}>{t.common.loading}</Text>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const t = useT();
  return (
    <View style={styles.center}>
      <Text style={styles.secondary}>{t.common.error}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t.common.retry}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.secondary}>{message}</Text>
    </View>
  );
}

export function MissingApiKey() {
  const t = useT();
  return (
    <View style={styles.center}>
      <Text style={styles.secondary}>{t.common.noApiKey}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  secondary: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
