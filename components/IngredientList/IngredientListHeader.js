/**
 * IngredientListHeader Component
 * 
 * Header section displaying title and ingredient count
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const IngredientListHeader = ({ 
  totalIngredients, 
  filteredCount,
  hasActiveFilters,
  topPadding = 20
}) => {
  const getSubtitleText = () => {
    if (hasActiveFilters) {
      return `${filteredCount} of ${totalIngredients} ingredients`;
    }
    return `${totalIngredients} ingredients`;
  };

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <Text style={styles.title}>Ingredient Database</Text>
      <Text style={styles.subtitle}>
        {getSubtitleText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});