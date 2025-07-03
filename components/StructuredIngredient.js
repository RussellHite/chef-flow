import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StructuredIngredientDisplay } from './StructuredIngredient/StructuredIngredientDisplay';
import { StructuredIngredientEditor } from './StructuredIngredient/StructuredIngredientEditor';
import { ManualParsingInterface } from './StructuredIngredient/ManualParsingInterface';
import { colors } from '../styles/colors';

/**
 * StructuredIngredient Component
 * 
 * Main orchestrator component that manages different modes:
 * - Display mode: Shows structured ingredient with actions
 * - Edit mode: Inline editing interface
 * - Manual parsing mode: Training interface for ingredient recognition
 */

export default function StructuredIngredient({ 
  ingredient, 
  onEdit, 
  onDelete, 
  onCreateStep,
  showActions = true,
  compact = false,
  forceEditMode = false
}) {
  const [isEditing, setIsEditing] = useState(forceEditMode);
  const [showManualParsing, setShowManualParsing] = useState(false);


  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    // If this was forced into edit mode (new ingredient), call onDelete
    if (forceEditMode && onDelete) {
      onDelete(ingredient);
    } else {
      // Otherwise just close edit mode
      setIsEditing(false);
    }
  };

  const handleEditSave = (updatedIngredient) => {
    onEdit?.(updatedIngredient, updatedIngredient.displayText);
    setIsEditing(false);
  };


  const handleManualParsingStart = () => {
    setShowManualParsing(true);
  };


  const handleManualParsingSave = (updatedIngredient) => {
    onEdit?.(updatedIngredient, updatedIngredient.displayText);
    setShowManualParsing(false);
  };

  const handleManualParsingCancel = () => {
    setShowManualParsing(false);
  };
  


  
  // Render modes
  if (showManualParsing) {
    return (
      <View style={styles.container}>
        <ManualParsingInterface
          ingredient={ingredient}
          onSave={handleManualParsingSave}
          onCancel={handleManualParsingCancel}
          onCreateStep={onCreateStep}
        />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <StructuredIngredientEditor
          ingredient={ingredient}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StructuredIngredientDisplay
        ingredient={ingredient}
        onEdit={handleEditStart}
        onDelete={onDelete}
        onCreateStep={onCreateStep}
        onManualParsing={handleManualParsingStart}
        showActions={showActions}
        compact={compact}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});