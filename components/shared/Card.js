/**
 * Card Component
 * 
 * Standardized card container with consistent styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const Card = ({
  children,
  style,
  variant = 'default',
  padding = 'normal'
}) => {
  const cardStyle = [
    styles.card,
    styles[`${variant}Card`],
    styles[`${padding}Padding`],
    style
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  subtitleStyle
}) => (
  <View style={[styles.header, style]}>
    <View style={styles.headerText}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
    </View>
    {children && (
      <View style={styles.headerActions}>
        {children}
      </View>
    )}
  </View>
);

export const CardContent = ({ children, style }) => (
  <View style={[styles.content, style]}>
    {children}
  </View>
);

export const CardFooter = ({ children, style }) => (
  <View style={[styles.footer, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevatedCard: {
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  flatCard: {
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  normalPadding: {
    padding: 16,
  },
  compactPadding: {
    padding: 12,
  },
  largePadding: {
    padding: 20,
  },
  nonePadding: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    // Base content styling
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});