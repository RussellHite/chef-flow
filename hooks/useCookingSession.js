/**
 * useCookingSession Hook
 * 
 * High-level cooking session operations and state management
 * Provides convenient methods for managing cooking sessions
 */

import { useEffect, useRef, useCallback } from 'react';
import { useCooking, COOKING_ACTIONS } from '../contexts/CookingContext';
import { 
  calculateTimerRemaining, 
  createSessionSummary,
  saveSessionToHistory,
  SESSION_CONFIG
} from '../utils/cookingSessionUtils';

/**
 * Default session values for fallback
 */
function getDefaultSessionValues() {
  return {
    isActive: false,
    activeRecipe: null,
    recipeName: '',
    currentStep: 1,
    currentStepIndex: 0,
    totalSteps: 0,
    timer: {
      isActive: false,
      isPaused: false,
      remainingTime: 0,
      duration: 0
    },
    sessionSummary: null,
    progress: 0,
    canGoNext: false,
    canGoPrevious: false,
    isFinalStep: false,
    startCookingSession: () => false,
    endCookingSession: () => false,
    goToStep: () => false,
    goToStepIndex: () => false,
    nextStep: () => false,
    previousStep: () => false,
    startStepTimer: () => false,
    stopStepTimer: () => false,
    toggleTimer: () => false,
    rawState: {}
  };
}

/**
 * Custom hook for cooking session management
 * @returns {Object} - Cooking session state and operations
 */
export function useCookingSession() {
  try {
    const context = useCooking();
    
    // Ensure context exists and has expected structure
    if (!context || typeof context !== 'object') {
      console.warn('useCookingSession: Invalid context, using defaults');
      return getDefaultSessionValues();
    }
    
    // Defensive destructuring with fallbacks
    const {
      cookingState = {},
      dispatch = () => {},
      isActiveCookingSession = false,
      activeRecipe = null,
      currentStep = 0,
      totalSteps = 0,
      recipeName = '',
      timer = {}
    } = context || {};

    const timerIntervalRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);

    /**
     * Start a new cooking session
     * @param {Object} recipe - Recipe object with id, title, steps
     * @param {Object} options - Additional options
     */
    const startCookingSession = useCallback((recipe, options = {}) => {
      if (!recipe) {
        console.warn('Cannot start cooking session: no recipe provided');
        return false;
      }

      if (isActiveCookingSession) {
        console.warn('Cannot start cooking session: another session is already active');
        return false;
      }

      try {
        dispatch({
          type: COOKING_ACTIONS.START_COOKING,
          payload: {
            recipe,
            recipeId: recipe.id || options.recipeId,
            recipeName: recipe.title || options.recipeName,
            totalSteps: recipe.steps?.length || options.totalSteps,
            startStep: options.startStep || 0
          }
        });

        console.log('Started cooking session for:', recipe.title);
        return true;
      } catch (error) {
        console.error('Failed to start cooking session:', error);
        return false;
      }
    }, [dispatch, isActiveCookingSession]);

    /**
     * End the current cooking session
     * @param {boolean} saveToHistory - Whether to save to cooking history
     */
    const endCookingSession = useCallback(async (saveToHistory = true) => {
      if (!isActiveCookingSession) {
        console.warn('No active cooking session to end');
        return false;
      }

      try {
        // Save to history before ending
        if (saveToHistory) {
          await saveSessionToHistory({
            ...cookingState,
            completedAt: Date.now(),
            status: 'completed'
          });
        }

        // Clear any active timers
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        dispatch({ type: COOKING_ACTIONS.END_COOKING });
        
        console.log('Ended cooking session for:', recipeName);
        return true;
      } catch (error) {
        console.error('Failed to end cooking session:', error);
        return false;
      }
    }, [isActiveCookingSession, cookingState, recipeName, dispatch]);

    /**
     * Navigate to a specific step
     * @param {number} stepIndex - Step index to navigate to (0-based)
     */
    const goToStep = useCallback((stepIndex) => {
      if (!isActiveCookingSession) {
        console.warn('No active cooking session');
        return false;
      }

      if (stepIndex < 0 || stepIndex >= totalSteps) {
        console.warn('Invalid step index:', stepIndex);
        return false;
      }

      dispatch({
        type: COOKING_ACTIONS.GO_TO_STEP,
        payload: { stepIndex }
      });

      return true;
    }, [isActiveCookingSession, totalSteps, dispatch]);

    /**
     * Move to next step
     */
    const nextStep = useCallback(() => {
      if (!isActiveCookingSession) {
        console.warn('No active cooking session');
        return false;
      }

      if (currentStep >= totalSteps - 1) {
        console.log('Reached final step, ending cooking session');
        endCookingSession(true);
        return true;
      }

      dispatch({
        type: COOKING_ACTIONS.UPDATE_STEP,
        payload: { direction: 'next' }
      });

      return true;
    }, [isActiveCookingSession, currentStep, totalSteps, dispatch, endCookingSession]);

    /**
     * Move to previous step
     */
    const previousStep = useCallback(() => {
      if (!isActiveCookingSession) {
        console.warn('No active cooking session');
        return false;
      }

      if (currentStep <= 0) {
        console.warn('Already at first step');
        return false;
      }

      dispatch({
        type: COOKING_ACTIONS.UPDATE_STEP,
        payload: { direction: 'previous' }
      });

      return true;
    }, [isActiveCookingSession, currentStep, dispatch]);

    /**
     * Start a timer for the current step
     * @param {number} duration - Timer duration in seconds
     * @param {Object} options - Timer options
     */
    const startStepTimer = useCallback((duration, options = {}) => {
      if (!isActiveCookingSession) {
        console.warn('No active cooking session');
        return false;
      }

      if (timer.isActive) {
        console.warn('Timer already active, stopping current timer first');
        dispatch({ type: COOKING_ACTIONS.STOP_TIMER });
      }

      dispatch({
        type: COOKING_ACTIONS.START_TIMER,
        payload: {
          stepId: options.stepId || currentStep,
          stepName: options.stepName || `Step ${currentStep + 1}`,
          duration
        }
      });

      return true;
    }, [isActiveCookingSession, timer.isActive, currentStep, dispatch]);

    /**
     * Stop the current timer
     */
    const stopStepTimer = useCallback(() => {
      if (!timer.isActive) {
        console.warn('No active timer to stop');
        return false;
      }

      dispatch({ type: COOKING_ACTIONS.STOP_TIMER });
      return true;
    }, [timer.isActive, dispatch]);

    /**
     * Pause/resume timer
     */
    const toggleTimer = useCallback(() => {
      if (!timer.isActive && !timer.isPaused) {
        console.warn('No timer to pause/resume');
        return false;
      }

      if (timer.isPaused) {
        dispatch({ type: COOKING_ACTIONS.RESUME_TIMER });
      } else {
        dispatch({ type: COOKING_ACTIONS.PAUSE_TIMER });
      }

      return true;
    }, [timer.isActive, timer.isPaused, dispatch]);

    // Timer countdown effect
    useEffect(() => {
      if (timer.isActive && !timer.isPaused) {
        timerIntervalRef.current = setInterval(() => {
          const remaining = calculateTimerRemaining(timer);
          
          if (remaining <= 0) {
            // Timer expired
            dispatch({ type: COOKING_ACTIONS.TIMER_EXPIRED });
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            
            // TODO: Trigger notification and navigation
            console.log('Timer expired for step:', timer.stepName);
          } else {
            // Update remaining time
            dispatch({
              type: COOKING_ACTIONS.UPDATE_TIMER,
              payload: { remainingTime: remaining }
            });
          }
        }, SESSION_CONFIG.TIMER_UPDATE_INTERVAL);
      } else {
        // Clear interval if timer is not active
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }

      // Cleanup on unmount
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }, [timer.isActive, timer.isPaused, timer.expiresAt, dispatch]);

    // Cleanup intervals on unmount
    useEffect(() => {
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }, []);

    // Create session summary for easy consumption
    const sessionSummary = createSessionSummary(cookingState);

    /**
     * Get session progress as percentage
     */
    const getProgress = useCallback(() => {
      if (totalSteps === 0) return 0;
      return Math.round(((currentStep + 1) / totalSteps) * 100);
    }, [currentStep, totalSteps]);

    /**
     * Check if session can navigate to next step
     */
    const canGoNext = currentStep < totalSteps - 1;

    /**
     * Check if session can navigate to previous step
     */
    const canGoPrevious = currentStep > 0;

    /**
     * Check if current step is the final step
     */
    const isFinalStep = currentStep === totalSteps - 1;

    return {
      // State
      isActive: isActiveCookingSession,
      activeRecipe,
      recipeName,
      currentStep: currentStep + 1, // Convert to 1-based for display
      currentStepIndex: currentStep, // Keep 0-based for programming
      totalSteps,
      timer,
      sessionSummary,
      
      // Computed values
      progress: getProgress(),
      canGoNext,
      canGoPrevious,
      isFinalStep,
      
      // Actions
      startCookingSession,
      endCookingSession,
      goToStep: (stepNumber) => goToStep(stepNumber - 1), // Convert from 1-based to 0-based
      goToStepIndex: goToStep, // Use 0-based index directly
      nextStep,
      previousStep,
      
      // Timer actions
      startStepTimer,
      stopStepTimer,
      toggleTimer,
      
      // Raw state for advanced usage
      rawState: cookingState
    };
  } catch (error) {
    console.error('useCookingSession error:', error);
    return getDefaultSessionValues();
  }
}

export default useCookingSession;