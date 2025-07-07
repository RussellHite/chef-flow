/**
 * IconButton Component
 * 
 * Standardized icon button with consistent styling
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export const IconButton = ({
  name,
  size = 20,
  color = colors.text,
  onPress,
  style,
  disabled = false,
  variant = 'default'
}) => {
  const buttonStyle = [
    styles.button,
    styles[`${variant}Button`],
    disabled && styles.disabled,
    style
  ];

  const iconColor = disabled ? colors.textSecondary : color;

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  defaultButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  successButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.success,
    borderRadius: 18,
  },
  errorButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
  },
  warningButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.warning,
    borderRadius: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});