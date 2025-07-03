/**
 * IngredientEditModal Component
 * 
 * Modal overlay for editing ingredient details
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { commonStyles } from '../../styles/common';

export const IngredientEditModal = ({
  ingredient,
  editForm,
  onFormChange,
  onSave,
  onCancel,
  visible
}) => {
  if (!visible || !ingredient) {
    return null;
  }

  const handleFieldChange = (field, value) => {
    onFormChange({ ...editForm, [field]: value });
  };

  return (
    <View style={styles.editOverlay}>
      <View style={styles.editPanel}>
        <View style={styles.editHeader}>
          <Text style={styles.editTitle}>Edit Ingredient</Text>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.editForm}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.name}
              onChangeText={(text) => handleFieldChange('name', text)}
              placeholder="Ingredient name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Plural</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.plural}
              onChangeText={(text) => handleFieldChange('plural', text)}
              placeholder="Plural form"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.category}
              onChangeText={(text) => handleFieldChange('category', text)}
              placeholder="Category"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Common Units</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.commonUnits}
              onChangeText={(text) => handleFieldChange('commonUnits', text)}
              placeholder="cup, tbsp, tsp (comma separated)"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Common Preparations</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.commonPreparations}
              onChangeText={(text) => handleFieldChange('commonPreparations', text)}
              placeholder="diced, chopped, sliced (comma separated)"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Search Terms</Text>
            <TextInput
              style={styles.fieldInput}
              value={editForm.searchTerms}
              onChangeText={(text) => handleFieldChange('searchTerms', text)}
              placeholder="Alternative names (comma separated)"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>
        </ScrollView>
        
        <View style={styles.editActions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={onSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    ...commonStyles.shadow,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '600',
  },
  editForm: {
    padding: 20,
    maxHeight: 400,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});