/**
 * IngredientCard Component
 * 
 * Displays a single ingredient with its details and edit functionality
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const IngredientCard = ({ 
  ingredient, 
  category, 
  onEdit
}) => {
  const handleEdit = () => {
    console.log('TouchableOpacity pressed for:', ingredient.name);
    onEdit(ingredient);
  };

  return (
    <View style={styles.ingredientCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {category?.name || ingredient.category}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.pluralText}>{ingredient.plural}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Common Units</Text>
          <Text style={styles.detailValue}>
            {ingredient.commonUnits?.join(', ') || 'None'}
          </Text>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Preparations</Text>
          <Text style={styles.detailValue}>
            {ingredient.commonPreparations?.join(', ') || 'None'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ingredientCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 11,
  },
  editButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pluralText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 8,
  },
  detailSection: {
    gap: 2,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
  },
});