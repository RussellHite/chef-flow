/**
 * StructuredIngredientEditor Component
 * 
 * Inline editing interface for structured ingredients
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnitSelector } from './UnitSelector';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { 
  MEASUREMENT_UNITS, 
  formatQuantity, 
  validateIngredientData 
} from '../../utils/ingredientFormatting';

export const StructuredIngredientEditor = ({ 
  ingredient, 
  onSave, 
  onCancel 
}) => {
  const { structured, displayText, originalText } = ingredient;
  
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editIngredient, setEditIngredient] = useState('');
  const [editPreparation, setEditPreparation] = useState('');

  // Initialize edit fields
  useEffect(() => {
    if (structured && structured.isStructured) {
      const quantity = structured.quantity;
      setEditQuantity(typeof quantity === 'number' ? quantity.toString() : (quantity || ''));
      
      // Handle both unit formats (database format with 'id' and UI format with 'value')
      const unitValue = structured.unit?.value || structured.unit?.id || structured.unit?.name || 'n/a';
      setEditUnit(unitValue);
      
      setEditIngredient(structured.ingredient?.name || displayText || originalText || '');
      setEditPreparation(structured.preparation?.name || '');
    } else {
      setEditQuantity('1');
      setEditUnit('n/a');
      setEditIngredient(displayText || originalText || '');
      setEditPreparation('');
    }
  }, [structured, displayText, originalText]);

  const handleSave = () => {
    const validation = validateIngredientData(editQuantity, editUnit, editIngredient);
    
    if (!validation.isValid) {
      console.warn('Validation errors:', validation.errors);
      return;
    }

    const unitData = MEASUREMENT_UNITS.find(u => u.value === editUnit);
    const parsedQuantity = editQuantity ? parseFloat(editQuantity) || 1 : 1;

    // Create unit object with both value/id for compatibility with both systems
    const unitObject = unitData ? {
      id: unitData.value,     // Database format
      value: unitData.value,  // UI format 
      name: unitData.label,
      label: unitData.label,
      plural: unitData.plural
    } : {
      id: editUnit,
      value: editUnit,
      name: editUnit,
      label: editUnit,
      plural: editUnit
    };

    const updatedStructured = {
      isStructured: true,
      quantity: parsedQuantity,
      unit: unitObject,
      ingredient: {
        id: structured?.ingredient?.id || 'custom',
        name: editIngredient.trim(),
        category: structured?.ingredient?.category || 'custom'
      },
      preparation: editPreparation.trim() ? { name: editPreparation.trim() } : null
    };

    // Ensure all parts are strings to prevent React child errors
    const quantityStr = String(formatQuantity(parsedQuantity) || '');
    const unitStr = String(unitData?.label || editUnit || '');
    const ingredientStr = String(editIngredient || '');
    const prepStr = editPreparation ? String(editPreparation) : '';
    
    const displayText = `${quantityStr} ${unitStr} ${ingredientStr}${prepStr ? ', ' + prepStr : ''}`.trim();
    
    const updatedIngredient = {
      ...ingredient,
      structured: updatedStructured,
      displayText: displayText,
      originalText: displayText // Ensure originalText is also a string
    };

    try {
      if (typeof onSave === 'function') {
        onSave(updatedIngredient);
      } else {
        console.error('onSave is not a function:', typeof onSave);
      }
    } catch (error) {
      console.error('Error in StructuredIngredientEditor onSave:', error);
    }
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  return (
    <View style={styles.editContainer}>
      <View style={styles.editRow}>
        {/* Quantity Input */}
        <View style={styles.quantityInput}>
          <Text style={styles.inputLabel}>Qty</Text>
          <TextInput
            value={editQuantity}
            onChangeText={setEditQuantity}
            style={styles.textInput}
            placeholder="1"
            keyboardType="numeric"
            selectTextOnFocus
          />
        </View>

        {/* Unit Selector */}
        <View style={styles.unitInput}>
          <Text style={styles.inputLabel}>Unit</Text>
          <UnitSelector
            value={editUnit}
            onValueChange={(value) => {
              // Ensure we only set string values
              if (typeof value === 'string') {
                setEditUnit(value);
              } else {
                console.warn('Non-string value passed to setEditUnit:', value);
              }
            }}
          />
        </View>
      </View>

      {/* Ingredient Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ingredient</Text>
        <TextInput
          value={editIngredient}
          onChangeText={setEditIngredient}
          style={styles.textInputFull}
          placeholder="Enter ingredient name"
          selectTextOnFocus
        />
      </View>

      {/* Preparation Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preparation (optional)</Text>
        <TextInput
          value={editPreparation}
          onChangeText={setEditPreparation}
          style={styles.textInputFull}
          placeholder="e.g., chopped, diced"
          selectTextOnFocus
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.editActions}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={16} color={colors.textSecondary} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleSave()} style={styles.saveButton}>
          <Ionicons name="checkmark" size={16} color={colors.surface} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quantityInput: {
    flex: 1,
    marginRight: 12,
  },
  unitInput: {
    flex: 2,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 12,
  },
  textInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  textInputFull: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
});