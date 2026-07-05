import React, { useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { StopLocation } from '@/api/resrobot';
import { useLocationSearch } from '@/hooks/queries';
import { useT } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

interface Props {
  placeholder: string;
  value: StopLocation | null;
  onSelect: (stop: StopLocation | null) => void;
  /** Visa "Min position" som förslag (för resesökens Från-fält). */
  myPosition?: StopLocation | null;
  /** Begränsa förslagen till riktiga hållplatser (av för adress/POI-sök). */
  stopsOnly?: boolean;
}

/**
 * Sökfält med autocomplete mot ResRobot location.name.
 * Debounce sköts av React Query-cachen + kort staleTime.
 */
export function StopSearchField({ placeholder, value, onSelect, myPosition, stopsOnly }: Props) {
  const t = useT();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const { data: results = [] } = useLocationSearch(focused ? text : '');
  const filtered = stopsOnly ? results.filter((r) => r.isStop) : results;

  const select = (stop: StopLocation) => {
    onSelect(stop);
    setText('');
    setFocused(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={value ? value.name : placeholder}
        placeholderTextColor={value ? colors.text : colors.textSecondary}
        value={text}
        onChangeText={(next) => {
          setText(next);
          if (value) onSelect(null);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoCorrect={false}
      />
      {focused && (text.length >= 2 || myPosition) ? (
        <View style={styles.dropdown}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filtered}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              myPosition ? (
                <TouchableOpacity style={styles.item} onPress={() => select(myPosition)}>
                  <Text style={styles.myPosition}>📍 {t.common.myPosition}</Text>
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => select(item)}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {item.isStop ? '🚏 ' : '📌 '}
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 10 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 260,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: { fontSize: 15, color: colors.text },
  myPosition: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
