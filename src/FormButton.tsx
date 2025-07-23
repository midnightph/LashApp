import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../src/colors';

export default function FormButton({ title, onPress, secondary = false, maxWidth, danger = false }: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  maxWidth?: number;
  danger? : boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, { maxWidth }, danger && styles.danger]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  secondaryText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  danger: {
    backgroundColor: colors.danger
  }
});
