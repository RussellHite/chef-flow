import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function ProfileScreen() {
  return (
    <View style={[commonStyles.container, commonStyles.centerContent]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your chef profile will appear here</Text>
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