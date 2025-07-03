/**
 * StructuredIngredientDisplay Component
 * 
 * Read-only display of structured ingredients with clear visual separation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { formatQuantity, formatUnit } from '../../utils/ingredientFormatting';

export const StructuredIngredientDisplay = ({ 
  ingredient, 
  onEdit,
  onDelete,
  onCreateStep,
  onManualParsing,
  showActions = true,
  compact = false
}) => {
  const { structured, displayText, originalText } = ingredient;
  const [showMenu, setShowMenu] = useState(false);

  // Render unstructured ingredient
  if (!structured || !structured.isStructured) {
    return (
      <View style={[styles.ingredientRow, compact && styles.compactRow]}>
        <View style={styles.ingredientContent}>
          <Text style={[styles.ingredientText, styles.unstructuredText]}>
            {displayText || originalText}
          </Text>
        </View>
        {showActions && (
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              onPress={() => setShowMenu(!showMenu)} 
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menu}>
                <TouchableOpacity onPress={() => { onEdit && onEdit(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
                {onManualParsing && (
                  <TouchableOpacity onPress={() => { onManualParsing(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                    <Text style={styles.parseIcon}>?</Text>
                    <Text style={styles.menuText}>Parse</Text>
                  </TouchableOpacity>
                )}
                {onCreateStep && (
                  <TouchableOpacity onPress={() => { onCreateStep(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                    <Ionicons name="add-circle" size={16} color={colors.success} />
                    <Text style={styles.menuText}>Create Step</Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity onPress={() => { onDelete(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                    <Ionicons name="trash" size={16} color={colors.error} />
                    <Text style={styles.menuText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  // Render structured ingredient
  const quantity = structured.quantity;
  const unit = structured.unit;
  const ingredientName = structured.ingredient?.name;
  const preparation = structured.preparation?.name;

  return (
    <View style={[styles.ingredientRow, compact && styles.compactRow]}>
      <View style={styles.ingredientContent}>
        <View style={styles.structuredContent}>
          {/* Main ingredient line */}
          <View style={styles.mainIngredientLine}>
            {/* Quantity */}
            {quantity !== null && quantity !== undefined && (
              <Text style={styles.quantityText}>
                {formatQuantity(quantity)}
              </Text>
            )}
            
            {/* Unit */}
            {unit && unit.value !== 'n/a' && (
              <Text style={styles.unitText}>
                {formatUnit(unit.value, quantity)}
              </Text>
            )}
            
            {/* Ingredient Name */}
            {ingredientName && (
              <Text style={styles.ingredientName}>
                {ingredientName}
              </Text>
            )}
          </View>
          
          {/* Preparation on new line */}
          {preparation && (
            <Text style={styles.preparationText}>
              {preparation}
            </Text>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            onPress={() => setShowMenu(!showMenu)} 
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          {showMenu && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={() => { onEdit && onEdit(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                <Ionicons name="pencil" size={16} color={colors.primary} />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              {onManualParsing && (
                <TouchableOpacity onPress={() => { onManualParsing(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                  <Text style={styles.parseIcon}>?</Text>
                  <Text style={styles.menuText}>Parse</Text>
                </TouchableOpacity>
              )}
              {onCreateStep && (
                <TouchableOpacity onPress={() => { onCreateStep(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                  <Ionicons name="add-circle" size={16} color={colors.success} />
                  <Text style={styles.menuText}>Create Step</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={() => { onDelete(ingredient); setShowMenu(false); }} style={styles.menuItem}>
                  <Ionicons name="trash" size={16} color={colors.error} />
                  <Text style={styles.menuText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 56,
  },
  compactRow: {
    paddingVertical: 8,
    minHeight: 40,
  },
  ingredientContent: {
    flex: 1,
  },
  structuredContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  mainIngredientLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  quantityText: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  unitText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginRight: 8,
    fontSize: 14,
  },
  ingredientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'normal',
    fontSize: 14,
    flexShrink: 1,
  },
  preparationText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 2,
    marginLeft: 0,
  },
  ingredientText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  unstructuredText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  menuContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  menuButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  parseIcon: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    width: 16,
    textAlign: 'center',
  },
});