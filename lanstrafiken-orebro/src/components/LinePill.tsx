import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

/** Linjenummer i en färgad "pill", som på fysiska skyltar. */
export function LinePill({ line }: { line: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text} numberOfLines={1}>
        {line}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minWidth: 40,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
