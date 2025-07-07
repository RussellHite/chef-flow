/**
 * CookingFlowLayout Component
 * 
 * Overall layout structure for the cooking flow screen
 */

import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { RecipeHeader } from './RecipeHeader';
import { StepContent } from './StepContent';
import { StepNavigationButtons } from './StepNavigationButtons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const CookingFlowLayout = ({
  workingRecipe,
  currentStepIndex,
  totalSteps,
  readyByTime,
  timeRemaining,
  currentStep,
  sentenceTimers,
  onAdjustTimer,
  onStartTimer,
  onResetTimer,
  onStopTimer,
  canGoPrevious,
  canGoNext,
  isFinalStep,
  isActive,
  onPreviousStep,
  onNextStep
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.recipeTitle}>{workingRecipe.title}</Text>
      </View>

      {/* Ready By Info */}
      {(readyByTime || timeRemaining) && (
        <View style={styles.readyBySection}>
          <Text style={styles.readyByText}>
            {readyByTime && timeRemaining 
              ? `Ready by ${readyByTime} (${timeRemaining})`
              : readyByTime || timeRemaining
            }
          </Text>
        </View>
      )}

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          STEP {currentStepIndex + 1} OF {totalSteps}
        </Text>
      </View>

      {/* Main Content */}
      <StepContent
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        sentenceTimers={sentenceTimers}
        onAdjustTimer={onAdjustTimer}
        onStartTimer={onStartTimer}
        onResetTimer={onResetTimer}
        onStopTimer={onStopTimer}
      />

      {/* Navigation Buttons */}
      <StepNavigationButtons
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isFinalStep={isFinalStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  recipeTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'left',
  },
  readyBySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  readyByText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepIndicator: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepIndicatorText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});