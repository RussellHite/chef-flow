import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

export default function Button({ title, onPress, style, textStyle, variant = 'primary' }) {
  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const buttonTextStyle = variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;

  return (
    <TouchableOpacity style={[buttonStyle, style]} onPress={onPress}>
      <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});