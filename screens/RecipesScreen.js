import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function RecipesScreen() {
  return (
    <View style={[commonStyles.container, commonStyles.centerContent]}>
      <Text style={styles.title}>Recipes</Text>
      <Text style={styles.subtitle}>Your recipe collection will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});