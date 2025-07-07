import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

export default function Button({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false,
  icon,
  iconPosition = 'left',
  size = 'medium'
}) {
  const buttonStyle = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    style
  ];
  
  const buttonTextStyle = [
    styles.buttonText,
    styles[`${variant}ButtonText`],
    styles[`${size}ButtonText`],
    disabled && styles.disabledText,
    textStyle
  ];

  const iconColor = disabled 
    ? colors.textSecondary 
    : variant === 'primary' 
      ? colors.surface 
      : colors.primary;

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={16} color={iconColor} style={styles.iconLeft} />
        )}
        {title && <Text style={buttonTextStyle}>{title}</Text>}
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={16} color={iconColor} style={styles.iconRight} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  
  // Variants
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  
  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  
  // Text styles
  buttonText: {
    ...typography.body,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  tertiaryButtonText: {
    color: colors.text,
  },
  dangerButtonText: {
    color: colors.surface,
  },
  successButtonText: {
    color: colors.surface,
  },
  
  // Size-specific text
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  
  // Icons
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  
  // Disabled states
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});