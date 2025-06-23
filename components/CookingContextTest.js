/**
 * Simple test component to verify CookingContext is working
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCooking } from '../contexts/CookingContext';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

export default function CookingContextTest() {
  try {
    const context = useCooking();
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cooking Context Test</Text>
        <Text style={styles.result}>✅ Context is working!</Text>
        <Text style={styles.detail}>
          Context available: {context ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.detail}>
          CookingState available: {context?.cookingState ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.detail}>
          Dispatch available: {context?.dispatch ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.detail}>
          Active session: {context?.isActiveCookingSession ? 'Yes' : 'No'}
        </Text>
      </View>
    );
  } catch (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cooking Context Test</Text>
        <Text style={styles.error}>❌ Error: {error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  result: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    color: colors.error || '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  detail: {
    ...typography.body,
    color: colors.text,
    marginBottom: 8,
  },
});