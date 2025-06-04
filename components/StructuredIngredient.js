import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
export default function StructuredIngredient({ 
  ingredient, 
  onEdit, 
  onDelete, 
  showActions = true,
  compact = false 
}) {
  const { structured, displayText, originalText } = ingredient;
  
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
      <View style={styles.ingredientContent}>
        {renderStructuredView()}
      </View>
      
      {showActions && (
        <View style={styles.ingredientActions}>
          <TouchableOpacity 
            onPress={() => onEdit?.(ingredient)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onDelete?.(ingredient)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={18} color={colors.error || colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
});