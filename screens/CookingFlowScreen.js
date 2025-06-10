import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import TimerService from '../services/TimerService';
import { useCookingSession } from '../hooks/useCookingSession';
import { useRecipes } from '../contexts/RecipeContext';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function CookingFlowScreen({ route, navigation }) {
  const { recipe, initialStepIndex = 0, resumeSession = false } = route.params || {};
  
  // Get recipes context to fetch recipe when resuming
  const { recipes } = useRecipes();
  
  // Use global cooking session management
  const {
    isActive,
    activeRecipe,
    rawState,
    startCookingSession,
    endCookingSession,
    currentStepIndex: globalStepIndex,
    goToStepIndex,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    isFinalStep
  } = useCookingSession();
  
  // Handle case where we're resuming a session vs starting a new one
  const [workingRecipe, setWorkingRecipe] = useState(null);
  
  // Local state for UI elements not managed by global state
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [readyByTime, setReadyByTime] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [timerValue, setTimerValue] = useState(0);

  // Determine which recipe to use
  useEffect(() => {
    if (resumeSession && isActive && activeRecipe) {
      // When resuming, try to find the full recipe from the recipes list
      console.log('Resuming session for recipe ID:', activeRecipe);
      const fullRecipe = recipes.find(r => r.id === activeRecipe);
      
      if (fullRecipe) {
        // Found the full recipe
        setWorkingRecipe(fullRecipe);
      } else {
        // Fallback: Create a minimal recipe structure for display
        console.log('Recipe not found in context, using minimal structure');
        const totalStepsCount = rawState?.totalSteps || 1;
        setWorkingRecipe({
          title: rawState?.recipeName || 'Active Recipe',
          steps: new Array(totalStepsCount).fill(null).map((_, index) => ({
            id: `step-${index}`,
            instruction: `Step ${index + 1}`,
            timing: null,
            ingredients: []
          }))
        });
      }
    } else if (recipe && recipe.steps) {
      // Use the provided recipe
      setWorkingRecipe(recipe);
    } else if (!resumeSession) {
      // Only navigate back if we're not trying to resume a session
      console.warn('No valid recipe provided to CookingFlowScreen');
      navigation.goBack();
      return;
    }
  }, [recipe, resumeSession, isActive, rawState, activeRecipe, recipes]);

  // These will be calculated inside the render when workingRecipe is available
  
  // Initialize cooking session when component mounts
  useEffect(() => {
    if (!isActive && !resumeSession && workingRecipe) {
      startCookingSession(workingRecipe, { startStep: initialStepIndex });
    }
  }, [workingRecipe]);
  
  // Sync local step index with global cooking context
  useEffect(() => {
    if (isActive && globalStepIndex !== currentStepIndex) {
      setCurrentStepIndex(globalStepIndex);
    }
  }, [globalStepIndex, isActive]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Cooking',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          onPress={async () => {
            await TimerService.clearAllTimers();
            endCookingSession(false); // End session without saving to history
            navigation.goBack();
          }} 
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (workingRecipe) {
      calculateTimes();
      setSentenceTimers({}); // Reset timers when step changes
    }
  }, [workingRecipe, currentStepIndex]);

  useEffect(() => {
    const unsubscribe = TimerService.addListener(setActiveTimers);
    return () => {
      unsubscribe();
    };
  }, []);

  const calculateTimes = () => {
    // Calculate total remaining time from current step onwards
    if (!workingRecipe || !workingRecipe.steps) return;
    
    const remainingMinutes = workingRecipe.steps.slice(currentStepIndex).reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);

    // Calculate ready by time
    const now = new Date();
    const readyTime = new Date(now.getTime() + remainingMinutes * 60000);
    
    const readyTimeString = readyTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    setReadyByTime(readyTimeString);
    
    // Format time remaining
    if (remainingMinutes > 60) {
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    } else {
      setTimeRemaining(`${remainingMinutes}m remaining`);
    }
  };

  const detectTiming = (sentence) => {
    if (!sentence) return null;
    
    // Timing patterns to match
    const timingPatterns = [
      // "cook for 20 minutes", "bake for 1 hour", "simmer for 5-10 minutes"
      /(\w+\s+for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "cook 20 minutes", "bake 30 mins"
      /(\w+\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "for 15 minutes", "for 1 hour"
      /(for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "15 minutes", "1 hour" (standalone)
      /^(\s*)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i
    ];
    
    for (const pattern of timingPatterns) {
      const match = sentence.match(pattern);
      if (match) {
        const timeValue = match[2];
        const timeUnit = match[3];
        const beforeTime = match[1];
        
        // Convert to minutes for consistency
        let timeInMinutes;
        if (timeValue.includes('-')) {
          // Handle ranges like "5-10"
          const [min, max] = timeValue.split('-').map(Number);
          timeInMinutes = Math.round((min + max) / 2);
        } else {
          timeInMinutes = parseInt(timeValue);
        }
        
        // Convert hours to minutes
        if (timeUnit.toLowerCase().startsWith('hour') || timeUnit.toLowerCase().startsWith('hr')) {
          timeInMinutes *= 60;
        }
        // Convert seconds to minutes
        else if (timeUnit.toLowerCase().startsWith('sec')) {
          timeInMinutes = Math.max(1, Math.round(timeInMinutes / 60)); // At least 1 minute
        }
        
        console.log('Detected timing:', { sentence, timeValue, timeInMinutes, timeUnit });
        
        return {
          originalTime: timeValue,
          timeInMinutes,
          timeUnit,
          beforeTime,
          fullMatch: match[0],
          sentence
        };
      }
    }
    
    return null;
  };

  const [sentenceTimers, setSentenceTimers] = useState({});
  const [activeTimers, setActiveTimers] = useState([]);

  const handlePreviousStep = () => {
    if (isActive && canGoPrevious) {
      previousStep();
    } else if (!isActive && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (isActive) {
      if (isFinalStep) {
        // Recipe completed - end session and navigate
        endCookingSession(true);
        navigation.navigate('Home');
      } else if (canGoNext) {
        nextStep();
      }
    } else {
      // Fallback to local state management
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        navigation.navigate('Home');
      }
    }
  };

  const adjustSentenceTimer = (sentenceIndex, delta) => {
    setSentenceTimers(prev => {
      const sentences = splitIntoSentences(currentStep?.content || '');
      const sentence = sentences[sentenceIndex];
      const timingInfo = detectTiming(sentence);
      
      if (!timingInfo) return prev;
      
      const currentTime = prev[sentenceIndex] !== undefined 
        ? prev[sentenceIndex] 
        : timingInfo.timeInMinutes;
      const newTime = Math.max(1, currentTime + delta);
      
      console.log(`Adjusting timer: ${currentTime} -> ${newTime} minutes`);
      
      return {
        ...prev,
        [sentenceIndex]: newTime
      };
    });
  };

  const getTimerId = (sentenceIndex) => {
    return `step-${currentStepIndex}-sentence-${sentenceIndex}`;
  };

  const handleStartTimer = async (sentenceIndex) => {
    const sentences = splitIntoSentences(currentStep?.content || '');
    const sentence = sentences[sentenceIndex];
    const timingInfo = detectTiming(sentence);
    const currentTime = sentenceTimers[sentenceIndex] || timingInfo?.timeInMinutes;
    const timerId = getTimerId(sentenceIndex);
    const existingTimer = TimerService.getTimer(timerId);
    
    console.log('Starting timer:', { sentenceIndex, currentTime, timerId });
    
    if (existingTimer) {
      if (existingTimer.isRunning) {
        await TimerService.pauseTimer(timerId);
      } else {
        await TimerService.resumeTimer(timerId);
      }
    } else {
      const recipeData = {
        recipeId: workingRecipe?.id || activeRecipe,
        stepIndex: currentStepIndex
      };
      await TimerService.startTimer(timerId, currentTime, sentence.substring(0, 30) + '...', recipeData);
    }
  };

  const handleResetTimer = (sentenceIndex) => {
    const timerId = getTimerId(sentenceIndex);
    TimerService.resetTimer(timerId);
  };

  const handleStopTimer = async (sentenceIndex) => {
    const timerId = getTimerId(sentenceIndex);
    await TimerService.stopTimer(timerId);
  };

  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    // Split by periods, exclamation marks, or question marks, but keep the punctuation
    const sentences = text.split(/([.!?]+)/)
      .reduce((acc, part, index, array) => {
        if (index % 2 === 0) {
          // This is the sentence content
          const punctuation = array[index + 1] || '';
          const sentence = (part + punctuation).trim();
          if (sentence.length > 0) {
            acc.push(sentence);
          }
        }
        return acc;
      }, []);
    
    // If no sentences were found (no punctuation), return the original text
    return sentences.length > 0 ? sentences : [text];
  };

  // Safety check - don't render until we have a working recipe
  if (!workingRecipe || !workingRecipe.steps) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {resumeSession ? 'Resuming cooking session...' : 'Loading recipe...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate current step and total steps when workingRecipe is available
  const currentStep = workingRecipe.steps?.[currentStepIndex] || {};
  const totalSteps = workingRecipe.steps?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.recipeTitle}>{workingRecipe.title}</Text>
      </View>

      {/* Ready By Info */}
      <View style={styles.readyBySection}>
        <Text style={styles.readyByText}>
          Ready by {readyByTime} ({timeRemaining})
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          STEP {currentStepIndex + 1} OF {totalSteps}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.stepScrollView}
          contentContainerStyle={styles.stepScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sentencesContainer}>
            {splitIntoSentences(currentStep?.content || 'No step content').map((sentence, sentenceIndex) => {
              const timingInfo = detectTiming(sentence);
              // Use manually adjusted time if available, otherwise use detected time
              const currentTime = sentenceTimers[sentenceIndex] !== undefined 
                ? sentenceTimers[sentenceIndex] 
                : timingInfo?.timeInMinutes;
              const timerId = getTimerId(sentenceIndex);
              const activeTimer = TimerService.getTimer(timerId);
              
              return (
                <View key={sentenceIndex} style={styles.sentenceWithTiming}>
                  <Text style={styles.stepText}>
                    {sentence}
                  </Text>
                  
                  {timingInfo && (
                    <View style={[
                      styles.timerBanner, 
                      activeTimer?.isOverflow && styles.timerBannerOverflow
                    ]}>
                      <View style={styles.timingControlsContainer}>
                        {!activeTimer && (
                          <>
                            <TouchableOpacity 
                              style={styles.timingButton}
                              onPress={() => adjustSentenceTimer(sentenceIndex, -1)}
                            >
                              <Ionicons name="remove" size={16} color={colors.text} />
                            </TouchableOpacity>
                            
                            <Text style={styles.timingValue}>
                              {currentTime} min
                            </Text>
                            
                            <TouchableOpacity 
                              style={styles.timingButton}
                              onPress={() => adjustSentenceTimer(sentenceIndex, 1)}
                            >
                              <Ionicons name="add" size={16} color={colors.text} />
                            </TouchableOpacity>
                          </>
                        )}
                        
                        {activeTimer && (
                          <Text style={styles.timingValue}>
                            {TimerService.formatTime(activeTimer.remainingTime)}
                          </Text>
                        )}
                        
                        <TouchableOpacity 
                          style={[
                            styles.startTimerButtonSmall,
                            activeTimer?.isRunning && styles.pauseTimerButton
                          ]}
                          onPress={() => handleStartTimer(sentenceIndex)}
                        >
                          <Text style={styles.startTimerTextSmall}>
                            {activeTimer 
                              ? (activeTimer.isRunning ? 'Pause' : 'Resume')
                              : 'Start Timer'
                            }
                          </Text>
                        </TouchableOpacity>
                        
                        {activeTimer && (
                          <>
                            <TouchableOpacity 
                              style={styles.resetTimerButton}
                              onPress={() => handleResetTimer(sentenceIndex)}
                            >
                              <Ionicons name="refresh" size={16} color={colors.text} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.stopTimerButton}
                              onPress={() => handleStopTimer(sentenceIndex)}
                            >
                              <Ionicons name="stop" size={16} color={colors.error} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>


      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          onPress={handlePreviousStep}
          style={[
            styles.navButton, 
            styles.secondaryButton,
            (!canGoPrevious && isActive) || (!isActive && currentStepIndex === 0) ? styles.disabledButton : {}
          ]}
          disabled={(!canGoPrevious && isActive) || (!isActive && currentStepIndex === 0)}
        >
          <Text style={[
            styles.navButtonText, 
            styles.secondaryButtonText,
            (!canGoPrevious && isActive) || (!isActive && currentStepIndex === 0) ? styles.disabledText : {}
          ]}>
            Previous Step
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNextStep}
          style={[styles.navButton, styles.primaryButton]}
        >
          <Text style={[styles.navButtonText, styles.primaryButtonText]}>
            {(isFinalStep && isActive) || (!isActive && currentStepIndex === totalSteps - 1) ? 'Finish' : 'Next Step'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepScrollView: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sentencesContainer: {
    gap: 16,
  },
  sentenceWithTiming: {
    marginBottom: 6,
  },
  stepText: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'left',
    lineHeight: 32,
    fontWeight: '400',
  },
  timerBanner: {
    backgroundColor: '#E5F7F0',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timerBannerOverflow: {
    backgroundColor: '#FFE5E5',
  },
  timingControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timingButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  startTimerButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  startTimerTextSmall: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  pauseTimerButton: {
    backgroundColor: colors.warning,
  },
  resetTimerButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopTimerButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.text,
  },
  primaryButtonText: {
    color: colors.surface,
  },
  headerButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});