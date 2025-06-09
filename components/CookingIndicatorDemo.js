/**
 * CookingIndicatorDemo Component
 * 
 * Demo component for testing the sticky cooking indicator functionality
 * Shows how the indicator appears during active cooking sessions
 * 
 * GitHub Issue #7: Sticky Cooking Progress Indicator
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCookingSession } from '../hooks/useCookingSession';
import { useCookingIndicator } from '../hooks/useCookingIndicator';
import { formatTimerDisplay } from '../utils/cookingSessionUtils';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

export default function CookingIndicatorDemo({ navigation }) {
  const cookingSession = useCookingSession();
  const indicatorState = useCookingIndicator({
    autoHide: true,
    persistOnBackground: true,
    enableAnimations: true
  });

  // Sample recipe for testing
  const [sampleRecipe] = useState({
    id: 'demo-recipe-indicator',
    title: 'Cooking Indicator Demo Recipe',
    steps: [
      { id: 'step1', content: 'Prepare all ingredients and gather equipment' },
      { id: 'step2', content: 'Heat oil in a large skillet over medium heat for 3 minutes' },
      { id: 'step3', content: 'Add diced onions and cook for 5-7 minutes until softened' },
      { id: 'step4', content: 'Add garlic and spices, cook for another 2 minutes until fragrant' },
      { id: 'step5', content: 'Add remaining ingredients and simmer for 15 minutes' },
      { id: 'step6', content: 'Season to taste and serve hot' }
    ]
  });

  const handleStartSession = () => {
    const success = cookingSession.startCookingSession(sampleRecipe);
    if (success) {
      Alert.alert(
        'Session Started', 
        'Check the bottom of the screen for the cooking indicator!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEndSession = () => {
    cookingSession.endCookingSession(true);
    Alert.alert('Session Ended', 'The cooking indicator should now disappear.');
  };

  const handleNextStep = () => {
    cookingSession.nextStep();
  };

  const handlePreviousStep = () => {
    cookingSession.previousStep();
  };

  const handleStartTimer = () => {
    const success = cookingSession.startStepTimer(180, { // 3 minutes
      stepName: `Step ${cookingSession.currentStep} Timer`
    });
    if (success) {
      Alert.alert('Timer Started', 'Watch the indicator update with timer countdown!');
    }
  };

  const handleStopTimer = () => {
    cookingSession.stopStepTimer();
  };

  const handleTestNavigation = () => {
    if (cookingSession.isActive) {
      Alert.alert(
        'Test Navigation',
        'Navigate to different tabs to see the indicator persist across screens!',
        [
          { text: 'Go to Home', onPress: () => navigation.navigate('Home') },
          { text: 'Go to Recipes', onPress: () => navigation.navigate('Recipes') },
          { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('No Active Session', 'Start a cooking session first to test navigation.');
    }
  };

  const renderSessionInfo = () => {
    if (!cookingSession.isActive) {
      return (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>No Active Session</Text>
          <Text style={styles.infoText}>Start a cooking session to see the indicator</Text>
        </View>
      );
    }

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Active Cooking Session</Text>
        <Text style={styles.infoText}>Recipe: {cookingSession.recipeName}</Text>
        <Text style={styles.infoText}>
          Step: {cookingSession.currentStep} of {cookingSession.totalSteps}
        </Text>
        <Text style={styles.infoText}>Progress: {cookingSession.progress}%</Text>
        {cookingSession.timer.isActive && (
          <Text style={styles.timerText}>
            Timer: {formatTimerDisplay(cookingSession.timer.remainingTime)}
          </Text>
        )}
      </View>
    );
  };

  const renderIndicatorState = () => {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Indicator State</Text>
        <Text style={styles.infoText}>Visible: {indicatorState.isVisible ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>Should Show: {indicatorState.shouldShow ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>Screen Width: {indicatorState.screenWidth}px</Text>
        <Text style={styles.infoText}>Small Screen: {indicatorState.isSmallScreen ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>App Active: {indicatorState.appIsActive ? 'Yes' : 'No'}</Text>
        
        {indicatorState.displayData && (
          <View style={styles.displayDataContainer}>
            <Text style={styles.subTitle}>Display Data:</Text>
            <Text style={styles.smallText}>Name: {indicatorState.displayData.recipeName}</Text>
            <Text style={styles.smallText}>Step: {indicatorState.displayData.stepInfo}</Text>
            <Text style={styles.smallText}>Progress: {indicatorState.displayData.progress}%</Text>
            {indicatorState.displayData.timerText && (
              <Text style={styles.smallText}>Timer: {indicatorState.displayData.timerText}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cooking Indicator Demo</Text>
      <Text style={styles.subtitle}>Test the sticky progress indicator functionality</Text>

      {renderSessionInfo()}
      {renderIndicatorState()}

      {/* Control Buttons */}
      <View style={styles.controlSection}>
        <Text style={styles.sectionTitle}>Session Controls</Text>
        
        {!cookingSession.isActive ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartSession}>
            <Ionicons name="play-circle" size={24} color={colors.surface} />
            <Text style={styles.primaryButtonText}>Start Cooking Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.dangerButton} onPress={handleEndSession}>
            <Ionicons name="stop-circle" size={24} color={colors.surface} />
            <Text style={styles.dangerButtonText}>End Cooking Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {cookingSession.isActive && (
        <>
          {/* Step Navigation */}
          <View style={styles.controlSection}>
            <Text style={styles.sectionTitle}>Step Navigation</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, !cookingSession.canGoPrevious && styles.disabledButton]}
                onPress={handlePreviousStep}
                disabled={!cookingSession.canGoPrevious}
              >
                <Ionicons name="chevron-back" size={20} color={colors.surface} />
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, !cookingSession.canGoNext && styles.disabledButton]}
                onPress={handleNextStep}
                disabled={!cookingSession.canGoNext}
              >
                <Text style={styles.buttonText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Timer Controls */}
          <View style={styles.controlSection}>
            <Text style={styles.sectionTitle}>Timer Controls</Text>
            
            <View style={styles.buttonRow}>
              {!cookingSession.timer.isActive ? (
                <TouchableOpacity style={styles.button} onPress={handleStartTimer}>
                  <Ionicons name="timer" size={20} color={colors.surface} />
                  <Text style={styles.buttonText}>Start 3min Timer</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.dangerButton} onPress={handleStopTimer}>
                  <Ionicons name="stop" size={20} color={colors.surface} />
                  <Text style={styles.dangerButtonText}>Stop Timer</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.button} onPress={cookingSession.toggleTimer}>
                <Ionicons 
                  name={cookingSession.timer.isPaused ? "play" : "pause"} 
                  size={20} 
                  color={colors.surface} 
                />
                <Text style={styles.buttonText}>
                  {cookingSession.timer.isPaused ? 'Resume' : 'Pause'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Test */}
          <View style={styles.controlSection}>
            <Text style={styles.sectionTitle}>Navigation Test</Text>
            
            <TouchableOpacity style={styles.button} onPress={handleTestNavigation}>
              <Ionicons name="navigate" size={20} color={colors.surface} />
              <Text style={styles.buttonText}>Test Cross-Tab Navigation</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>How to Test</Text>
        <Text style={styles.instruction}>1. Start a cooking session to show the indicator</Text>
        <Text style={styles.instruction}>2. Navigate between steps to see progress updates</Text>
        <Text style={styles.instruction}>3. Start a timer to see real-time countdown</Text>
        <Text style={styles.instruction}>4. Navigate to other tabs - indicator should persist</Text>
        <Text style={styles.instruction}>5. Tap the indicator to return to cooking screen</Text>
        <Text style={styles.instruction}>6. End session to hide the indicator</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  
  infoCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  
  infoText: {
    ...typography.body,
    color: colors.text,
    marginBottom: 4,
  },
  
  timerText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  
  displayDataContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  subTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  
  smallText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  controlSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 12,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  
  dangerButton: {
    backgroundColor: colors.error || '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  
  buttonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  
  dangerButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  
  instructionsSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
});