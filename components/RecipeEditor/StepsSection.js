/**
 * StepsSection Component
 * 
 * Steps section component for recipe editing with add, edit, delete, and reorder functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StepEditor from '../StepEditor';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const StepsSection = ({
  steps = [],
  ingredients = [],
  onStepUpdate,
  onStepDelete,
  onStepAdd,
  onStepReorder
}) => {
  const handleAddStep = (afterIndex) => {
    if (onStepAdd) {
      onStepAdd(afterIndex);
    }
  };

  const handleAddStepAtEnd = () => {
    handleAddStep(steps.length - 1);
  };

  return (
    <View style={styles.stepsSection}>
      <View style={styles.stepsSectionHeader}>
        <Text style={styles.stepsSectionTitle}>
          Cooking Steps ({steps.length} steps)
        </Text>
        <TouchableOpacity 
          onPress={handleAddStepAtEnd}
          style={styles.addStepButton}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addStepButtonText}>Add Step</Text>
        </TouchableOpacity>
      </View>
      
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <StepEditor
            step={step}
            index={index}
            ingredients={ingredients}
            onUpdate={onStepUpdate}
            onDelete={onStepDelete}
            onAddAfter={handleAddStep}
            onReorder={onStepReorder}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
            compact={true}
          />
        </View>
      ))}
      
      {steps.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No steps yet</Text>
          <Text style={styles.emptyStateText}>Add your first cooking step to get started</Text>
          <TouchableOpacity 
            onPress={handleAddStepAtEnd}
            style={styles.emptyStateButton}
          >
            <Ionicons name="add" size={20} color={colors.surface} />
            <Text style={styles.emptyStateButtonText}>Add First Step</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stepsSection: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  stepsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepsSectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addStepButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  stepContainer: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    ...typography.body,
    color: colors.surface,
    marginLeft: 8,
    fontWeight: '600',
  },
});