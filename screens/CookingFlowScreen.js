import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimerService from '../services/TimerService';
import { useCookingSession } from '../hooks/useCookingSession';
import { useRecipes } from '../contexts/RecipeContext';
import { useCookingTracking } from '../hooks/useIngredientTracking';
import { CookingFlowLayout } from '../components/CookingFlow/CookingFlowLayout';
import { LoadingScreen } from '../components/CookingFlow/LoadingScreen';
import { colors } from '../styles/colors';
import { 
  splitIntoSentences, 
  detectTiming, 
  calculateRemainingTime,
  calculateReadyByTime,
  formatTimingDuration,
  clampTimeValue
} from '../utils/timingUtils';

export default function CookingFlowScreen({ route, navigation }) {
  const { 
    recipe, 
    recipeId, 
    initialStepIndex = 0, 
    resumeSession = false, 
    resumeFromNotification = false 
  } = route.params || {};
  
  // Get recipes context to fetch recipe when resuming
  const { recipes } = useRecipes();
  
  // Initialize cooking tracking
  const cookingTracking = useCookingTracking();
  
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
    isFinalStep,
    startStepTimer,
    stopStepTimer,
    toggleTimer,
    timer: globalTimer
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
    if (resumeFromNotification && !workingRecipe) {
      // When resuming from notification, prefer the passed recipe first
      if (recipe) {
        console.log('✅ Using recipe passed from notification:', recipe.title);
        console.log('🎯 Will navigate to step:', initialStepIndex);
        setWorkingRecipe(recipe);
        setCurrentStepIndex(initialStepIndex);
        
        // If we have an active session, navigate to the specified step
        if (isActive && goToStepIndex) {
          setTimeout(() => {
            goToStepIndex(initialStepIndex);
          }, 100);
        }
      } else if (recipeId) {
        // Try to find recipe by ID
        console.log('🔍 Looking up recipe from notification:', recipeId);
        const fullRecipe = recipes.find(r => r.id === recipeId);
        
        if (fullRecipe) {
          console.log('✅ Found recipe for notification:', fullRecipe.title);
          console.log('🎯 Will navigate to step:', initialStepIndex);
          setWorkingRecipe(fullRecipe);
          setCurrentStepIndex(initialStepIndex);
          
          // If we have an active session, navigate to the specified step
          if (isActive && goToStepIndex) {
            setTimeout(() => {
              goToStepIndex(initialStepIndex);
            }, 100);
          }
        } else {
          console.log('⚠️ Recipe not found for notification, using active recipe');
          // Fallback to active recipe if available
          if (activeRecipe) {
            const activeFullRecipe = recipes.find(r => r.id === activeRecipe);
            if (activeFullRecipe) {
              setWorkingRecipe(activeFullRecipe);
            }
          }
        }
      }
    } else if (resumeSession && isActive && activeRecipe && !workingRecipe) {
      // When resuming, try to find the full recipe from the recipes list
      // console.log('Resuming session for recipe ID:', activeRecipe);
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
  }, [recipe, recipeId, resumeSession, resumeFromNotification, isActive, rawState, activeRecipe, recipes]);

  // These will be calculated inside the render when workingRecipe is available
  
  // Initialize cooking session when component mounts
  useEffect(() => {
    if (!isActive && !resumeSession && workingRecipe) {
      startCookingSession(workingRecipe, { startStep: initialStepIndex });
      
      // Track cooking session start
      if (cookingTracking.isInitialized) {
        cookingTracking.trackCookingStarted(workingRecipe);
      }
    }
  }, [workingRecipe]);
  
  // Sync local step index with global cooking context
  useEffect(() => {
    if (isActive && globalStepIndex !== currentStepIndex) {
      // Don't override if we just navigated from notification
      if (!resumeFromNotification) {
        setCurrentStepIndex(globalStepIndex);
      }
    }
  }, [globalStepIndex, isActive, resumeFromNotification]);

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
    
    const remainingMinutes = calculateRemainingTime(workingRecipe.steps, currentStepIndex);
    const readyBy = calculateReadyByTime(remainingMinutes);
    
    if (readyBy) {
      setReadyByTime(readyBy.formatted);
    }
    
    // Format time remaining using utility
    const formattedRemaining = formatTimingDuration(remainingMinutes);
    setTimeRemaining(formattedRemaining ? `${formattedRemaining} remaining` : '');
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
      const newTime = clampTimeValue(currentTime + delta, 1, 480); // 1 min to 8 hours
      
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
    
    console.log('Starting timer:', { sentenceIndex, currentTime, sentence });
    
    // Check if this is the same timer that's already running globally
    if (globalTimer?.isActive && globalTimer?.stepId === `${currentStepIndex}-${sentenceIndex}`) {
      // Toggle the existing global timer
      toggleTimer();
    } else {
      // Start a new global timer
      const durationInSeconds = (currentTime || 5) * 60; // Convert minutes to seconds
      startStepTimer(durationInSeconds, {
        stepId: `${currentStepIndex}-${sentenceIndex}`,
        stepName: sentence.substring(0, 30) + '...'
      });
      
      // Also start local timer for UI display
      const timerId = getTimerId(sentenceIndex);
      const recipeData = {
        recipeId: workingRecipe?.id || activeRecipe,
        stepIndex: currentStepIndex
      };
      await TimerService.startTimer(timerId, currentTime, sentence.substring(0, 30) + '...', recipeData);
    }
  };

  const handleResetTimer = (sentenceIndex) => {
    // Stop the global timer if it's for this sentence
    if (globalTimer?.isActive && globalTimer?.stepId === `${currentStepIndex}-${sentenceIndex}`) {
      stopStepTimer();
    }
    
    // Reset local timer
    const timerId = getTimerId(sentenceIndex);
    TimerService.resetTimer(timerId);
  };

  const handleStopTimer = async (sentenceIndex) => {
    // Stop the global timer if it's for this sentence
    if (globalTimer?.isActive && globalTimer?.stepId === `${currentStepIndex}-${sentenceIndex}`) {
      stopStepTimer();
    }
    
    // Stop local timer
    const timerId = getTimerId(sentenceIndex);
    await TimerService.stopTimer(timerId);
  };


  // Safety check - don't render until we have a working recipe
  if (!workingRecipe || !workingRecipe.steps) {
    return <LoadingScreen resumeSession={resumeSession} />;
  }

  // Calculate current step and total steps when workingRecipe is available
  const currentStep = workingRecipe.steps?.[currentStepIndex] || {};
  const totalSteps = workingRecipe.steps?.length || 0;

  return (
    <CookingFlowLayout
      workingRecipe={workingRecipe}
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      readyByTime={readyByTime}
      timeRemaining={timeRemaining}
      currentStep={currentStep}
      sentenceTimers={sentenceTimers}
      onAdjustTimer={adjustSentenceTimer}
      onStartTimer={handleStartTimer}
      onResetTimer={handleResetTimer}
      onStopTimer={handleStopTimer}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      isFinalStep={isFinalStep}
      isActive={isActive}
      onPreviousStep={handlePreviousStep}
      onNextStep={handleNextStep}
    />
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
});