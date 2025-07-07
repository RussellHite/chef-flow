/**
 * Badge Component
 * 
 * Small status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const Badge = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle
}) => {
  const badgeStyle = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style
  ];

  const badgeTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle
  ];

  return (
    <View style={badgeStyle}>
      <Text style={badgeTextStyle}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Variants
  defaultBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBadge: {
    backgroundColor: `${colors.primary}1A`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  successBadge: {
    backgroundColor: `${colors.success}1A`,
    borderWidth: 1,
    borderColor: colors.success,
  },
  warningBadge: {
    backgroundColor: `${colors.warning}1A`,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  errorBadge: {
    backgroundColor: `${colors.error}1A`,
    borderWidth: 1,
    borderColor: colors.error,
  },
  neutralBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Sizes
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mediumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  largeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  // Text styles
  text: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultText: {
    color: colors.text,
  },
  primaryText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  
  // Size-specific text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});