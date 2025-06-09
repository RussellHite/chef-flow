/**
 * CookingSessionDemo Component
 * 
 * Demo component for testing cooking session functionality
 * Shows how to use the cooking context and session management
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  Alert 
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useCookingSession } from '../hooks/useCookingSession';
import { formatTimerDisplay } from '../utils/cookingSessionUtils';

export default function CookingSessionDemo() {
  const {
    isActive,
    recipeName,
    currentStep,
    currentStepIndex,
    totalSteps,
    timer,
    progress,
    canGoNext,
    canGoPrevious,
    isFinalStep,
    startCookingSession,
    endCookingSession,
    nextStep,
    previousStep,
    goToStep,
    startStepTimer,
    stopStepTimer,
    toggleTimer,
    sessionSummary
  } = useCookingSession();

  const [timerDuration, setTimerDuration] = useState('60');

  // Sample recipe for testing
  const sampleRecipe = {
    id: 'demo-recipe',
    title: 'Cooking Session Demo Recipe',
    steps: [
      { id: 'step1', content: 'Prepare ingredients and workspace' },
      { id: 'step2', content: 'Heat oil in a large skillet over medium heat' },
      { id: 'step3', content: 'Add onions and cook for 3-4 minutes until softened' },
      { id: 'step4', content: 'Add garlic and cook for another minute' },
      { id: 'step5', content: 'Season with salt and pepper to taste' },
      { id: 'step6', content: 'Serve hot and enjoy!' }
    ]
  };

  const handleStartCooking = () => {
    const success = startCookingSession(sampleRecipe);
    if (success) {
      Alert.alert('Success', 'Cooking session started!');
    } else {
      Alert.alert('Error', 'Failed to start cooking session');
    }
  };

  const handleEndCooking = () => {
    Alert.alert(
      'End Cooking Session',
      'Are you sure you want to end the current cooking session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: () => {
            endCookingSession(true);
            Alert.alert('Session Ended', 'Cooking session has been completed!');
          }
        }
      ]
    );
  };

  const handleStartTimer = () => {
    const duration = parseInt(timerDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid timer duration in seconds');
      return;
    }

    const success = startStepTimer(duration, {
      stepName: `Step ${currentStep} Timer`
    });

    if (success) {
      Alert.alert('Timer Started', `Timer set for ${duration} seconds`);
    }
  };

  const handleStopTimer = () => {
    stopStepTimer();
    Alert.alert('Timer Stopped', 'Timer has been stopped');
  };

  const renderSessionInfo = () => {
    if (!isActive) {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>No Active Session</Text>
          <Text style={styles.infoText}>Start a cooking session to see session information</Text>
        </View>
      );
    }

    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Active Session</Text>
        <Text style={styles.infoText}>Recipe: {recipeName}</Text>
        <Text style={styles.infoText}>
          Step: {currentStep} of {totalSteps} ({progress}% complete)
        </Text>
        <Text style={styles.infoText}>
          Current Step: {sampleRecipe.steps[currentStepIndex]?.content || 'Unknown step'}
        </Text>
        
        {timer.isActive && (
          <View style={styles.timerInfo}>
            <Text style={styles.timerText}>
              ⏰ {timer.stepName}: {formatTimerDisplay(timer.remainingTime)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderNavigationControls = () => {
    if (!isActive) return null;

    return (
      <View style={styles.navigationContainer}>
        <Text style={styles.sectionTitle}>Navigation Controls</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, !canGoPrevious && styles.disabledButton]}
            onPress={previousStep}
            disabled={!canGoPrevious}
          >
            <Text style={[styles.buttonText, !canGoPrevious && styles.disabledText]}>
              Previous Step
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, !canGoNext && styles.disabledButton]}
            onPress={nextStep}
            disabled={!canGoNext}
          >
            <Text style={[styles.buttonText, !canGoNext && styles.disabledText]}>
              {isFinalStep ? 'Complete' : 'Next Step'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subSectionTitle}>Jump to Step:</Text>
        <View style={styles.stepButtonsContainer}>
          {sampleRecipe.steps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepButton,
                index === currentStepIndex && styles.activeStepButton
              ]}
              onPress={() => goToStep(index + 1)}
            >
              <Text style={[
                styles.stepButtonText,
                index === currentStepIndex && styles.activeStepButtonText
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTimerControls = () => {
    if (!isActive) return null;

    return (
      <View style={styles.timerContainer}>
        <Text style={styles.sectionTitle}>Timer Controls</Text>
        
        <View style={styles.timerInputContainer}>
          <Text style={styles.label}>Duration (seconds):</Text>
          <TextInput
            style={styles.timerInput}
            value={timerDuration}
            onChangeText={setTimerDuration}
            keyboardType="numeric"
            placeholder="60"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, timer.isActive && styles.disabledButton]}
            onPress={handleStartTimer}
            disabled={timer.isActive}
          >
            <Text style={[styles.buttonText, timer.isActive && styles.disabledText]}>
              Start Timer
            </Text>
          </TouchableOpacity>
          
          {timer.isActive && (
            <TouchableOpacity 
              style={styles.button}
              onPress={toggleTimer}
            >
              <Text style={styles.buttonText}>
                {timer.isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
          )}
          
          {(timer.isActive || timer.isPaused) && (
            <TouchableOpacity 
              style={[styles.button, styles.dangerButton]}
              onPress={handleStopTimer}
            >
              <Text style={[styles.buttonText, styles.dangerText]}>
                Stop Timer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cooking Session Demo</Text>
      
      {renderSessionInfo()}
      
      <View style={styles.mainControls}>
        <Text style={styles.sectionTitle}>Session Controls</Text>
        
        {!isActive ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartCooking}>
            <Text style={styles.primaryButtonText}>Start Cooking Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleEndCooking}>
            <Text style={[styles.buttonText, styles.dangerText]}>End Cooking Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderNavigationControls()}
      {renderTimerControls()}

      {sessionSummary && (
        <View style={styles.debugContainer}>
          <Text style={styles.sectionTitle}>Session Summary</Text>
          <Text style={styles.debugText}>{JSON.stringify(sessionSummary, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  
  subSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  
  infoContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  
  timerInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  
  timerText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  mainControls: {
    marginBottom: 20,
  },
  
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  
  navigationContainer: {
    marginBottom: 20,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  
  button: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  dangerButton: {
    backgroundColor: colors.error || '#FF6B6B',
    borderColor: colors.error || '#FF6B6B',
  },
  
  buttonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  
  disabledText: {
    color: colors.textSecondary,
  },
  
  dangerText: {
    color: colors.surface,
  },
  
  stepButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  activeStepButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  stepButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  
  activeStepButtonText: {
    color: colors.surface,
  },
  
  timerContainer: {
    marginBottom: 20,
  },
  
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  label: {
    ...typography.body,
    color: colors.text,
    marginRight: 12,
    minWidth: 120,
  },
  
  timerInput: {
    ...typography.body,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  
  debugText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});