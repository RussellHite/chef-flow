/**
 * StepNavigationButtons Component
 * 
 * Navigation controls for moving between cooking steps
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../Button';
import { colors } from '../../styles/colors';

export const StepNavigationButtons = ({
  canGoPrevious,
  canGoNext,
  isFinalStep,
  currentStepIndex,
  totalSteps,
  onPreviousStep,
  onNextStep
}) => {
  const getNextButtonText = () => {
    if (isFinalStep) {
      return 'Finish Recipe';
    }
    return `Next Step (${currentStepIndex + 2}/${totalSteps})`;
  };

  const getPreviousButtonText = () => {
    return `Previous Step (${currentStepIndex}/${totalSteps})`;
  };

  return (
    <View style={styles.navigationButtons}>
      {/* Previous Step Button */}
      <Button
        title={getPreviousButtonText()}
        onPress={onPreviousStep}
        disabled={!canGoPrevious}
        style={[
          styles.navButton,
          styles.previousButton,
          !canGoPrevious && styles.disabledButton
        ]}
        textStyle={[
          styles.navButtonText,
          !canGoPrevious && styles.disabledText
        ]}
        icon="chevron-back"
      />

      {/* Next Step Button */}
      <Button
        title={getNextButtonText()}
        onPress={onNextStep}
        disabled={!canGoNext && !isFinalStep}
        style={[
          styles.navButton,
          styles.nextButton,
          isFinalStep && styles.finishButton
        ]}
        textStyle={styles.nextButtonText}
        icon={isFinalStep ? "checkmark" : "chevron-forward"}
        iconPosition="right"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
  },
  previousButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  finishButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  navButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  nextButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.textSecondary,
  },
});