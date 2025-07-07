/**
 * RecipeHeader Component
 * 
 * Header showing recipe title and cooking progress info
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const RecipeHeader = ({
  title,
  readyByTime,
  timeRemaining
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.recipeTitle}>{title}</Text>
      
      {(readyByTime || timeRemaining) && (
        <View style={styles.readyBySection}>
          <Text style={styles.readyByText}>
            {readyByTime && timeRemaining 
              ? `Ready by ${readyByTime} (${timeRemaining})`
              : readyByTime || timeRemaining
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipeTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  readyBySection: {
    backgroundColor: `${colors.success}1A`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  readyByText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
});