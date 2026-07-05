import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Attribution } from '@/components/Attribution';
import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { colors, radius, spacing } from '@/theme';

/** Inställningar, biljettinfo (kommer i Fas 3) och om-appen. */
export function MoreScreen() {
  const t = useT();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t.more.language}</Text>
      <View style={styles.languageRow}>
        {(['sv', 'en'] as const).map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.languageButton, language === lang && styles.languageActive]}
            onPress={() => setLanguage(lang)}
          >
            <Text
              style={[
                styles.languageText,
                language === lang && styles.languageTextActive,
              ]}
            >
              {lang === 'sv' ? 'Svenska' : 'English'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.heading}>{t.more.tickets}</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>{t.more.ticketsInfo}</Text>
      </View>

      <Text style={styles.heading}>{t.more.about}</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>{t.more.aboutText}</Text>
        <Text style={styles.version}>{t.more.version} 0.1.0</Text>
      </View>

      <Attribution />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  languageRow: { flexDirection: 'row', gap: spacing.sm },
  languageButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  languageActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  languageText: { fontSize: 15, color: colors.text, fontWeight: '600' },
  languageTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  version: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.md },
});
