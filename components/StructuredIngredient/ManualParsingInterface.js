/**
 * ManualParsingInterface Component
 * 
 * Complex manual parsing UI for training ingredient recognition
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { convertToPresentTense, capitalizeFirst } from '../../utils/textUtils';
import { convertManualPartsToStructured } from '../../utils/ingredientFormatting';

export const ManualParsingInterface = ({ 
  ingredient, 
  onSave, 
  onCancel,
  onCreateStep 
}) => {
  const { originalText, displayText } = ingredient;
  const [manualParts, setManualParts] = useState([]);

  // Initialize manual parts when component mounts
  React.useEffect(() => {
    const text = originalText || displayText || '';
    const parts = text.split(/[,\s]+/).filter(p => p.trim().length > 0).map(part => ({
      text: part.trim(),
      type: 'unassigned' // quantity, unit, ingredient, description, action
    }));
    setManualParts(parts);
  }, [originalText, displayText]);

  const assignPartType = (partIndex, type) => {
    const newParts = [...manualParts];
    newParts[partIndex].type = type;
    setManualParts(newParts);
  };

  const handleSave = async () => {
    try {
      // Convert manual parts to structured format
      const structured = convertManualPartsToStructured(manualParts);
      
      // Build display text
      const quantity = manualParts.filter(p => p.type === 'quantity').map(p => p.text).join(' ');
      const unit = manualParts.filter(p => p.type === 'unit').map(p => p.text).join(' ');
      const ingredientName = manualParts.filter(p => p.type === 'ingredient').map(p => p.text).join(' ');
      const description = manualParts.filter(p => p.type === 'description').map(p => p.text).join(' ');
      const action = manualParts.filter(p => p.type === 'action').map(p => p.text).join(' ');

      let displayText = '';
      if (quantity) displayText += quantity + ' ';
      if (unit) displayText += unit + ' ';
      if (ingredientName) displayText += ingredientName;
      if (description) displayText += ', ' + description;

      // Ensure we have something to work with
      if (!displayText.trim()) {
        displayText = originalText || 'ingredient';
      }

      // Create updated ingredient
      const updatedIngredient = {
        ...ingredient,
        structured,
        displayText: displayText.trim(),
        originalText: displayText.trim()
      };

      // If there's an action, create a step from it
      if (action && onCreateStep) {
        try {
          let stepContent = '';
          
          // Add action in present tense
          const presentTenseAction = convertToPresentTense(action || '');
          if (presentTenseAction) {
            stepContent += capitalizeFirst(presentTenseAction) + ' ';
          }
          
          // Add quantity and unit
          if (quantity) stepContent += quantity + ' ';
          if (unit) stepContent += unit + ' ';
          
          // Add ingredient name
          if (ingredientName) {
            stepContent += ingredientName;
          } else if (ingredient.structured?.ingredient?.name) {
            stepContent += ingredient.structured.ingredient.name;
          } else {
            stepContent += 'ingredient';
          }
          
          const ingredientId = ingredient?.id || ingredient?.originalText || 'unknown';
          onCreateStep(stepContent.trim(), ingredientId);
        } catch (stepError) {
          console.warn('Error creating step from action:', stepError);
        }
      }

      // Save the updated ingredient
      onSave && onSave(updatedIngredient);
    } catch (error) {
      console.error('Error in manual parsing save:', error);
      Alert.alert('Error', 'Failed to save ingredient parsing. Please try again.');
    }
  };

  const typeColors = {
    quantity: colors.primary,
    unit: colors.secondary || '#6B7280',
    ingredient: colors.success || '#10B981', 
    description: colors.warning || '#F59E0B',
    action: colors.info || '#3B82F6',
    unassigned: colors.textSecondary
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Parsing Training</Text>
      <Text style={styles.subtitle}>
        Tap each word to assign its type:
      </Text>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: typeColors.quantity }]} />
          <Text style={styles.legendText}>Quantity</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: typeColors.unit }]} />
          <Text style={styles.legendText}>Unit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: typeColors.ingredient }]} />
          <Text style={styles.legendText}>Ingredient</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: typeColors.description }]} />
          <Text style={styles.legendText}>Description</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: typeColors.action }]} />
          <Text style={styles.legendText}>Action</Text>
        </View>
      </View>

      {/* Parts to assign */}
      <View style={styles.partsContainer}>
        {manualParts.map((part, index) => (
          <View key={index} style={styles.partRow}>
            <Text style={[styles.partText, { color: typeColors[part.type] }]}>
              "{part.text}"
            </Text>
            <View style={styles.typeButtons}>
              {['quantity', 'unit', 'ingredient', 'description', 'action'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton, 
                    part.type === type && styles.activeTypeButton,
                    { borderColor: typeColors[type] }
                  ]}
                  onPress={() => assignPartType(index, type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    part.type === type && { color: colors.surface }
                  ]}>
                    {type[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Preview:</Text>
        <Text style={styles.previewText}>
          {manualParts.filter(p => p.type === 'quantity').map(p => p.text).join(' ')} {' '}
          {manualParts.filter(p => p.type === 'unit').map(p => p.text).join(' ')} {' '}
          {manualParts.filter(p => p.type === 'ingredient').map(p => p.text).join(' ')}
          {manualParts.filter(p => p.type === 'description').length > 0 && 
            ', ' + manualParts.filter(p => p.type === 'description').map(p => p.text).join(' ')
          }
        </Text>
        {manualParts.filter(p => p.type === 'action').length > 0 && (
          <Text style={styles.actionPreviewText}>
            Action: {manualParts.filter(p => p.type === 'action').map(p => p.text).join(' ')}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={16} color={colors.textSecondary} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={16} color={colors.surface} />
          <Text style={styles.saveButtonText}>Save & Train</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
    fontSize: 18,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 12,
  },
  partsContainer: {
    marginBottom: 16,
  },
  partRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partText: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  typeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
    color: colors.text,
  },
  previewContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  previewTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
    fontSize: 14,
  },
  previewText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
  },
  actionPreviewText: {
    ...typography.body,
    color: colors.info || '#3B82F6',
    fontStyle: 'italic',
    fontWeight: '500',
    marginTop: 4,
  },
  actions: {
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