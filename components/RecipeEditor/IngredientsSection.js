/**
 * IngredientsSection Component
 * 
 * Ingredients card component for recipe editing with add, edit, and delete functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StructuredIngredient from '../StructuredIngredient';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/common';

export const IngredientsSection = ({
  ingredients = [],
  recognizedCount,
  needsReviewCount,
  newIngredientEditing,
  tempNewIngredient,
  onEditIngredient,
  onDeleteIngredient,
  onAddIngredient,
  onCreateStepFromAction,
  onNewIngredientSave,
  onNewIngredientCancel
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>
            Ingredients
          </Text>
          <Text style={styles.cardSubtitle}>
            {needsReviewCount} need review
          </Text>
        </View>
        <TouchableOpacity 
          onPress={onAddIngredient}
          style={styles.addButton}
          disabled={newIngredientEditing}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={[
            styles.ingredientItem,
            index < ingredients.length - 1 && styles.ingredientItemWithBorder
          ]}>
            <StructuredIngredient
              ingredient={ingredient}
              onEdit={onEditIngredient}
              onDelete={onDeleteIngredient}
              onCreateStep={onCreateStepFromAction}
              showActions={true}
              compact={false}
            />
          </View>
        ))}
        
        {newIngredientEditing && tempNewIngredient && (
          <View>
            {ingredients.length > 0 && <View style={styles.separator} />}
            <StructuredIngredient
              key={tempNewIngredient.id}
              ingredient={tempNewIngredient}
              onEdit={onNewIngredientSave}
              onDelete={onNewIngredientCancel}
              onCreateStep={() => {}}
              showActions={true}
              forceEditMode={true}
              compact={false}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'normal',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientItemWithBorder: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
});