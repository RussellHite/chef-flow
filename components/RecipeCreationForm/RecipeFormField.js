/**
 * RecipeFormField Component
 * 
 * Reusable form field component for recipe creation
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const RecipeFormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength,
  helpText,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.fieldContainer, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...textInputProps}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {helpText && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  characterCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});