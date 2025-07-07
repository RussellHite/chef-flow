/**
 * LoadingScreen Component
 * 
 * Loading state display for cooking flow initialization
 */

import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const LoadingScreen = ({ resumeSession = false }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {resumeSession ? 'Resuming cooking session...' : 'Loading recipe...'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});