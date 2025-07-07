/**
 * QuantityInput Component
 * 
 * Standardized quantity input with increment/decrement buttons
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { IconButton } from './IconButton';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const QuantityInput = ({
  value,
  onValueChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  style,
  inputStyle,
  disabled = false,
  showButtons = true
}) => {
  const handleIncrement = () => {
    const newValue = Math.min(max, (value || 0) + step);
    onValueChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, (value || 0) - step);
    onValueChange(newValue);
  };

  const handleTextChange = (text) => {
    const numValue = parseFloat(text) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onValueChange(clampedValue);
  };

  return (
    <View style={[styles.container, style]}>
      {showButtons && (
        <IconButton
          name="remove"
          onPress={handleDecrement}
          disabled={disabled || value <= min}
          variant="default"
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, inputStyle]}
          value={value?.toString() || '0'}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          editable={!disabled}
          selectTextOnFocus
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      
      {showButtons && (
        <IconButton
          name="add"
          onPress={handleIncrement}
          disabled={disabled || value >= max}
          variant="default"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 50,
  },
  unit: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 14,
  },
});