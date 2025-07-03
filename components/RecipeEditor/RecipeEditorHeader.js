/**
 * RecipeEditorHeader Component
 * 
 * Header component for recipe editing with title input, progress, and action buttons
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const RecipeEditorHeader = ({
  title,
  onTitleChange,
  servings,
  isSaving,
  onCancel,
  onSave,
  onEditImage,
  editedRecipe
}) => {
  const handleEditImage = () => {
    Alert.alert(
      'Edit Recipe Image',
      'Choose how you want to add or change the recipe image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Take photo feature coming soon') },
        { text: 'Choose from Library', onPress: () => console.log('Photo library feature coming soon') },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          onPress={onCancel}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.titleSection}>
          <TextInput
            value={title}
            onChangeText={onTitleChange}
            style={styles.titleInput}
            placeholder="Recipe name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <TouchableOpacity 
          onPress={onEditImage || handleEditImage}
          style={styles.editImageButton}
        >
          <Ionicons name="camera" size={20} color={colors.primary} />
          <View style={styles.incompleteBadge}>
            <Text style={styles.incompleteBadgeText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerServingsRow}>
        <Text style={styles.servingsText}>{servings} servings</Text>
      </View>
      
      <View style={styles.headerBottomRow}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            onPress={onSave}
            style={styles.saveButton}
            disabled={isSaving}
          >
            <Ionicons name="save" size={16} color={colors.surface} />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  titleInput: {
    ...typography.h2,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  editImageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    position: 'relative',
  },
  incompleteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incompleteBadgeText: {
    ...typography.caption,
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  headerServingsRow: {
    marginBottom: 12,
  },
  servingsText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.surface,
    marginLeft: 6,
    fontWeight: '600',
  },
});