import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

/**
 * StructuredIngredient Component
 * 
 * Displays ingredients with clear visual separation of components:
 * - Quantity (highlighted)
 * - Unit 
 * - Base ingredient name
 * - Preparation method (if any)
 */
// Common measurement units for dropdown
const MEASUREMENT_UNITS = [
  { value: 'cup', label: 'cup', plural: 'cups' },
  { value: 'tbsp', label: 'tbsp', plural: 'tbsp' },
  { value: 'tsp', label: 'tsp', plural: 'tsp' },
  { value: 'oz', label: 'oz', plural: 'oz' },
  { value: 'lb', label: 'lb', plural: 'lbs' },
  { value: 'gram', label: 'gram', plural: 'grams' },
  { value: 'kg', label: 'kg', plural: 'kg' },
  { value: 'ml', label: 'ml', plural: 'ml' },
  { value: 'liter', label: 'liter', plural: 'liters' },
  { value: 'piece', label: 'piece', plural: 'pieces' },
  { value: 'clove', label: 'clove', plural: 'cloves' },
  { value: 'can', label: 'can', plural: 'cans' },
  { value: 'package', label: 'package', plural: 'packages' }
];

export default function StructuredIngredient({ 
  ingredient, 
  onEdit, 
  onDelete, 
  showActions = true,
  compact = false 
}) {
  const { structured, displayText, originalText } = ingredient;
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editPreparation, setEditPreparation] = useState('');
  const [showManualParsing, setShowManualParsing] = useState(false);
  const [manualParts, setManualParts] = useState([]);

  const handleEditStart = () => {
    if (structured && structured.isStructured) {
      const quantity = structured.quantity;
      setEditQuantity(typeof quantity === 'number' ? quantity.toString() : (quantity || ''));
      setEditUnit(structured.unit?.value || 'cup');
      setEditPreparation(structured.preparation?.name || '');
    } else {
      // For unstructured ingredients, try to parse basic info
      setEditQuantity('1');
      setEditUnit('cup');
      setEditPreparation('');
    }
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditQuantity('');
    setEditUnit('');
    setEditPreparation('');
  };

  const handleEditSave = () => {
    // Build new ingredient text from edited components
    const baseIngredientName = structured?.ingredient?.name || 'ingredient';
    const unitData = MEASUREMENT_UNITS.find(u => u.value === editUnit);
    const unitLabel = parseFloat(editQuantity) === 1 ? unitData?.label : unitData?.plural;
    
    let newText = `${editQuantity} ${unitLabel} ${baseIngredientName}`;
    if (editPreparation.trim()) {
      newText += `, ${editPreparation.trim()}`;
    }
    
    onEdit?.(ingredient, newText);
    setIsEditing(false);
  };

  const adjustQuantity = (delta) => {
    const currentQty = parseFloat(editQuantity) || 0;
    const newQty = Math.max(0, currentQty + delta);
    setEditQuantity(newQty.toString());
  };

  const handleManualParsingStart = () => {
    // Split the original text by common delimiters
    const text = originalText || displayText || '';
    const parts = text.split(/[,\s]+/).filter(p => p.trim().length > 0).map(part => ({
      text: part.trim(),
      type: 'unassigned' // quantity, unit, ingredient, description
    }));
    
    setManualParts(parts);
    setShowManualParsing(true);
  };

  const assignPartType = (partIndex, type) => {
    const newParts = [...manualParts];
    newParts[partIndex].type = type;
    setManualParts(newParts);
  };

  const handleManualParsingSave = async () => {
    // Build structured data from manual assignments
    const quantity = manualParts.filter(p => p.type === 'quantity').map(p => p.text).join(' ');
    const unit = manualParts.filter(p => p.type === 'unit').map(p => p.text).join(' ');
    const ingredientName = manualParts.filter(p => p.type === 'ingredient').map(p => p.text).join(' ');
    const description = manualParts.filter(p => p.type === 'description').map(p => p.text).join(' ');

    // Build new ingredient text (same as preview)
    let newText = '';
    if (quantity) newText += quantity + ' ';
    if (unit) newText += unit + ' ';
    if (ingredientName) newText += ingredientName;
    if (description) newText += ', ' + description;

    // Create structured ingredient object for immediate display
    const unitData = MEASUREMENT_UNITS.find(u => u.label.toLowerCase() === unit.toLowerCase() || u.plural.toLowerCase() === unit.toLowerCase());
    const parsedQuantity = quantity ? parseFloat(quantity.match(/[\d.]+/)?.[0] || '1') : null;
    
    // Fix unit pluralization - if unit not found in standard units, create proper plural
    const finalUnit = unitData || (unit ? { 
      value: unit, 
      name: unit, 
      plural: unit.endsWith('s') ? unit : unit + 's'  // Better pluralization logic
    } : null);
    
    const newStructuredIngredient = {
      quantity: parsedQuantity,
      unit: finalUnit,
      ingredient: { 
        id: 'trained', 
        name: ingredientName || 'ingredient', 
        category: 'custom' 
      },
      preparation: description ? { 
        id: 'trained', 
        name: description, 
        requiresStep: true 
      } : null,
      originalText: newText.trim(),
      isStructured: true
    };

    // Save the manual parsing as training data
    await saveParsingTrainingData(originalText || displayText, {
      quantity: quantity || null,
      unit: unit || null,
      ingredient: ingredientName || null,
      description: description || null,
      parts: manualParts,
      structured: newStructuredIngredient
    });

    // Update the ingredient with new structured data
    const updatedIngredient = {
      ...ingredient,
      originalText: newText.trim(),
      structured: newStructuredIngredient,
      displayText: newText.trim()
    };

    onEdit?.(updatedIngredient, newText.trim());
    setShowManualParsing(false);
  };

  const saveParsingTrainingData = async (originalText, manualParsing) => {
    // Use the training service to save data
    const TrainingDataService = await import('../services/TrainingDataService.js').then(m => m.default);
    TrainingDataService.saveTrainingData(originalText, manualParsing);
    // console.log('Saved parsing training data:', { originalText, manualParsing });
  };
  
  const renderStructuredView = () => {
    if (!structured || !structured.isStructured) {
      return (
        <Text style={styles.ingredientText}>{displayText || originalText}</Text>
      );
    }
    
    const { quantity, unit, ingredient: baseIngredient, preparation } = structured;
    
    return (
      <View style={styles.structuredContainer}>
        {/* Quantity - highlighted */}
        {quantity !== null && (
          <Text style={styles.quantityText}>
            {typeof quantity === 'number' ? formatQuantity(quantity) : quantity}
          </Text>
        )}
        
        {/* Unit */}
        {unit && (
          <Text style={styles.unitText}>
            {quantity === 1 ? unit.name : unit.plural}
          </Text>
        )}
        
        {/* Base ingredient name */}
        <Text style={styles.ingredientName}>
          {baseIngredient.name}
        </Text>
        
        {/* Preparation method */}
        {preparation && (
          <View style={styles.preparationContainer}>
            <Text style={styles.preparationText}>
              {preparation.name}
            </Text>
            {preparation.requiresStep && (
              <Ionicons 
                name="arrow-forward-circle" 
                size={14} 
                color={colors.primary} 
                style={styles.prepIcon}
              />
            )}
          </View>
        )}
        
        {/* Divided indicator */}
        {structured.isDivided && (
          <View style={styles.dividedContainer}>
            <Ionicons 
              name="git-branch" 
              size={12} 
              color={colors.warning || '#F59E0B'} 
              style={styles.dividedIcon}
            />
            <Text style={styles.dividedText}>divided</Text>
          </View>
        )}
      </View>
    );
  };

  const renderManualParsingMode = () => {
    const typeColors = {
      quantity: colors.primary,
      unit: colors.secondary || '#6B7280',
      ingredient: colors.success || '#10B981', 
      description: colors.warning || '#F59E0B',
      unassigned: colors.textSecondary
    };

    return (
      <View style={styles.manualParsingContainer}>
        <Text style={styles.manualParsingTitle}>Manual Parsing Training</Text>
        <Text style={styles.manualParsingSubtitle}>
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
        </View>

        {/* Parts to assign */}
        <View style={styles.partsContainer}>
          {manualParts.map((part, index) => (
            <View key={index} style={styles.partRow}>
              <Text style={[styles.partText, { color: typeColors[part.type] }]}>
                "{part.text}"
              </Text>
              <View style={styles.typeButtons}>
                {['quantity', 'unit', 'ingredient', 'description'].map(type => (
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
        </View>

        {/* Action buttons */}
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowManualParsing(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleManualParsingSave}>
            <Text style={styles.saveButtonText}>Save & Train</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEditMode = () => {
    const baseIngredientName = structured?.ingredient?.name || displayText || originalText;
    
    return (
      <View style={styles.editContainer}>
        {/* Quantity controls row */}
        <View style={styles.quantityRow}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => adjustQuantity(-0.25)}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.quantityInput}
            value={editQuantity}
            onChangeText={setEditQuantity}
            keyboardType="numeric"
            placeholder="1"
          />
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => adjustQuantity(0.25)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.unitDropdown}>
            <Picker
              selectedValue={editUnit}
              onValueChange={setEditUnit}
              style={styles.picker}
            >
              {MEASUREMENT_UNITS.map(unit => (
                <Picker.Item 
                  key={unit.value} 
                  label={unit.label} 
                  value={unit.value} 
                />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.ingredientNameEdit}>{baseIngredientName}</Text>
        </View>
        
        {/* Preparation text field */}
        <TextInput
          style={styles.preparationInput}
          value={editPreparation}
          onChangeText={setEditPreparation}
          placeholder="chopped, diced, etc..."
          placeholderTextColor={colors.textSecondary}
        />
        
        {/* Action buttons */}
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleEditCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {renderStructuredView()}
        {showActions && (
          <View style={styles.compactActions}>
            <TouchableOpacity onPress={() => onEdit?.(ingredient)} style={styles.actionButton}>
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete?.(ingredient)} style={styles.actionButton}>
              <Ionicons name="trash" size={16} color={colors.error || colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.ingredientRow}>
      {showManualParsing ? (
        renderManualParsingMode()
      ) : isEditing ? (
        renderEditMode()
      ) : (
        <>
          <View style={styles.ingredientContent}>
            {renderStructuredView()}
          </View>
          
          {showActions && (
            <View style={styles.ingredientActions}>
              <TouchableOpacity 
                onPress={handleEditStart}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleManualParsingStart}
                style={styles.actionButton}
              >
                <Ionicons name="construct" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => onDelete?.(ingredient)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={18} color={colors.error || colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

/**
 * Format quantity for display (convert decimals to fractions when appropriate)
 */
function formatQuantity(quantity) {
  // Common cooking fractions
  const fractions = {
    0.125: '1/8',
    0.25: '1/4',
    0.333: '1/3',
    0.5: '1/2',
    0.667: '2/3',
    0.75: '3/4'
  };
  
  const whole = Math.floor(quantity);
  const decimal = quantity - whole;
  
  // Check if decimal part matches a common fraction
  for (const [value, fraction] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(value)) < 0.02) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }
  
  // Return as decimal or whole number
  return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
}

const styles = StyleSheet.create({
  // Full row layout
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  ingredientContent: {
    flex: 1,
  },
  
  // Compact layout
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  compactActions: {
    flexDirection: 'row',
    gap: 4,
  },
  
  // Structured ingredient display
  structuredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  
  quantityText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 30,
  },
  
  unitText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  
  ingredientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '400',
  },
  
  preparationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  
  preparationText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  prepIcon: {
    marginLeft: 4,
  },

  dividedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },

  dividedIcon: {
    marginRight: 2,
  },

  dividedText: {
    ...typography.caption,
    color: colors.warning || '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Fallback for unstructured ingredients
  ingredientText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'left',
  },
  
  // Actions
  ingredientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
  },

  // Edit mode styles
  editContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    minWidth: 60,
    color: colors.text,
  },

  unitDropdown: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    minWidth: 80,
    height: 40,
    justifyContent: 'center',
  },

  picker: {
    height: 40,
    color: colors.text,
  },

  ingredientNameEdit: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },

  preparationInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: colors.text,
  },

  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  saveButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '500',
  },

  // Manual parsing styles
  manualParsingContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  manualParsingTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },

  manualParsingSubtitle: {
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
  },

  previewText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
  },
});