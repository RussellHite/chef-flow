/**
 * RecipeFormHeader Component
 * 
 * Header section for recipe creation form with instructions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const RecipeFormHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.subtitle}>
        Enter your recipe ingredients and steps - we'll convert it into a step-by-step cooking flow
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});