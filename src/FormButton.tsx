import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../src/colors';

export default function FormButton({ title, onPress, secondary = false }: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  maxWidth?: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  text: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
  },
});
