/**
 * RecipeFormActions Component
 * 
 * Action buttons for recipe creation form (cancel and submit)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../Button';
import { colors } from '../../styles/colors';

export const RecipeFormActions = ({
  onCancel,
  onSubmit,
  isProcessing,
  isValid,
  submitText = 'Next',
  cancelText = 'Cancel'
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Button
        title={cancelText}
        onPress={onCancel}
        variant="outline"
        style={styles.cancelButton}
        disabled={isProcessing}
      />
      <Button
        title={isProcessing ? 'Processing...' : submitText}
        onPress={onSubmit}
        style={styles.nextButton}
        disabled={!isValid || isProcessing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});