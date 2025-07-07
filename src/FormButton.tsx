import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../src/colors';

export default function FormButton({ title, onPress, secondary = false, maxWidth }: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  maxWidth?: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, { maxWidth }]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
