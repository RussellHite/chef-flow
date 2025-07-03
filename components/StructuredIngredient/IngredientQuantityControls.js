/**
 * IngredientQuantityControls Component
 * 
 * +/- controls for adjusting ingredient quantities
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { formatQuantity, formatUnit, adjustQuantity } from '../../utils/ingredientFormatting';

export const IngredientQuantityControls = ({ 
  quantity, 
  unit, 
  onAdjust,
  step = 1,
  minValue = 0
}) => {
  const handleAdjust = (delta) => {
    const newQuantity = adjustQuantity(quantity, delta);
    onAdjust && onAdjust(newQuantity);
  };

  const currentQuantity = typeof quantity === 'string' ? parseFloat(quantity) || 0 : quantity || 0;
  const canDecrease = currentQuantity > minValue;
  const unitDisplay = formatUnit(unit?.value || unit, quantity);

  return (
    <View style={styles.quantityControls}>
      <TouchableOpacity 
        onPress={() => handleAdjust(-step)}
        style={[styles.quantityButton, !canDecrease && styles.quantityButtonDisabled]}
        disabled={!canDecrease}
      >
        <Ionicons 
          name="remove" 
          size={16} 
          color={canDecrease ? colors.text : colors.textSecondary} 
        />
      </TouchableOpacity>
      
      <View style={styles.quantityDisplay}>
        <Text style={styles.quantityValue}>
          {formatQuantity(quantity)}
        </Text>
        {unitDisplay && (
          <Text style={styles.quantityUnit}>
            {unitDisplay}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        onPress={() => handleAdjust(step)}
        style={styles.quantityButton}
      >
        <Ionicons name="add" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  quantityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  quantityValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 12,
  },
});