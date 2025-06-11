/**
 * CookingContext
 * 
 * Global cooking session management using React Context API
 * Manages cooking state, timers, and session persistence across app navigation
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for persisting cooking sessions
const COOKING_SESSION_STORAGE_KEY = 'chef-flow-cooking-session';

// Initial cooking state
const initialCookingState = {
  // Session Identity
  sessionId: null,
  startedAt: null,
  lastActiveAt: null,
  
  // Recipe Information
  activeRecipe: null,          // Recipe ID being cooked
  recipeName: '',              // Recipe name for display
  totalSteps: 0,               // Total number of steps
  
  // Progress Tracking
  currentStep: 0,              // Current step index (0-based)
  completedSteps: [],          // Array of completed step indices
  stepHistory: [],             // Step progression history
  
  // Session Status
  isActiveCookingSession: false, // Whether cooking is in progress
  status: 'inactive',           // 'inactive' | 'active' | 'paused' | 'completed'
  
  // Timer State
  timer: {
    stepId: null,              // Which step the timer belongs to
    stepName: '',              // Display name for timer
    duration: 0,               // Original timer duration (seconds)
    remainingTime: 0,          // Seconds remaining
    isActive: false,           // Timer running status
    isPaused: false,           // Timer is paused
    startedAt: null,           // When timer was started
    expiresAt: null            // When timer will expire
  }
};

// Action types for cooking state management
export const COOKING_ACTIONS = {
  // Session Management
  START_COOKING: 'START_COOKING',
  END_COOKING: 'END_COOKING',
  PAUSE_COOKING: 'PAUSE_COOKING',
  RESUME_COOKING: 'RESUME_COOKING',
  RESTORE_SESSION: 'RESTORE_SESSION',
  
  // Step Management
  UPDATE_STEP: 'UPDATE_STEP',
  COMPLETE_STEP: 'COMPLETE_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  
  // Timer Management
  START_TIMER: 'START_TIMER',
  UPDATE_TIMER: 'UPDATE_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  RESUME_TIMER: 'RESUME_TIMER',
  STOP_TIMER: 'STOP_TIMER',
  TIMER_EXPIRED: 'TIMER_EXPIRED'
};

/**
 * Cooking state reducer
 * Handles all cooking session state updates
 */
function cookingReducer(state, action) {
  const timestamp = Date.now();
  
  switch (action.type) {
    case COOKING_ACTIONS.START_COOKING: {
      const { recipe, recipeId, recipeName, totalSteps, startStep = 0 } = action.payload;
      const sessionId = `cooking_${timestamp}`;
      
      return {
        ...state,
        // Session Identity
        sessionId,
        startedAt: timestamp,
        lastActiveAt: timestamp,
        
        // Recipe Information
        activeRecipe: recipeId,
        recipeName: recipeName || recipe?.title || 'Unknown Recipe',
        totalSteps: totalSteps || recipe?.steps?.length || 0,
        
        // Progress Tracking
        currentStep: startStep,
        completedSteps: [],
        stepHistory: [{
          stepIndex: startStep,
          startedAt: timestamp,
          completedAt: null
        }],
        
        // Session Status
        isActiveCookingSession: true,
        status: 'active'
      };
    }
    
    case COOKING_ACTIONS.END_COOKING: {
      return {
        ...initialCookingState,
        // Keep some session info for history
        lastCompletedSession: {
          sessionId: state.sessionId,
          recipeId: state.activeRecipe,
          recipeName: state.recipeName,
          completedAt: timestamp,
          totalSteps: state.totalSteps,
          completedSteps: state.completedSteps.length,
          duration: timestamp - state.startedAt
        }
      };
    }
    
    case COOKING_ACTIONS.PAUSE_COOKING: {
      return {
        ...state,
        status: 'paused',
        lastActiveAt: timestamp,
        // Pause any active timer
        timer: state.timer.isActive ? {
          ...state.timer,
          isPaused: true,
          isActive: false
        } : state.timer
      };
    }
    
    case COOKING_ACTIONS.RESUME_COOKING: {
      return {
        ...state,
        status: 'active',
        lastActiveAt: timestamp,
        // Resume timer if it was paused
        timer: state.timer.isPaused ? {
          ...state.timer,
          isPaused: false,
          isActive: true,
          startedAt: timestamp,
          expiresAt: timestamp + (state.timer.remainingTime * 1000)
        } : state.timer
      };
    }
    
    case COOKING_ACTIONS.UPDATE_STEP: {
      const { stepIndex, direction = 'next' } = action.payload;
      const newStepIndex = stepIndex !== undefined ? stepIndex : 
                          direction === 'next' ? state.currentStep + 1 : 
                          Math.max(0, state.currentStep - 1);
      
      // Complete current step if moving forward
      const newCompletedSteps = direction === 'next' && !state.completedSteps.includes(state.currentStep) ?
        [...state.completedSteps, state.currentStep] : state.completedSteps;
      
      // Update step history
      const newStepHistory = [...state.stepHistory];
      const currentStepHistory = newStepHistory.find(h => h.stepIndex === state.currentStep && !h.completedAt);
      if (currentStepHistory) {
        currentStepHistory.completedAt = timestamp;
      }
      
      // Add new step to history
      if (newStepIndex !== state.currentStep) {
        newStepHistory.push({
          stepIndex: newStepIndex,
          startedAt: timestamp,
          completedAt: null
        });
      }
      
      return {
        ...state,
        currentStep: newStepIndex,
        completedSteps: newCompletedSteps,
        stepHistory: newStepHistory,
        lastActiveAt: timestamp,
        // Stop any active timer when changing steps
        timer: initialCookingState.timer
      };
    }
    
    case COOKING_ACTIONS.COMPLETE_STEP: {
      const { stepIndex = state.currentStep } = action.payload;
      
      if (!state.completedSteps.includes(stepIndex)) {
        return {
          ...state,
          completedSteps: [...state.completedSteps, stepIndex],
          lastActiveAt: timestamp
        };
      }
      return state;
    }
    
    case COOKING_ACTIONS.GO_TO_STEP: {
      const { stepIndex } = action.payload;
      
      if (stepIndex >= 0 && stepIndex < state.totalSteps) {
        return cookingReducer(state, {
          type: COOKING_ACTIONS.UPDATE_STEP,
          payload: { stepIndex }
        });
      }
      return state;
    }
    
    case COOKING_ACTIONS.START_TIMER: {
      const { stepId, stepName, duration } = action.payload;
      const expiresAt = timestamp + (duration * 1000);
      
      return {
        ...state,
        timer: {
          stepId: stepId !== undefined ? stepId : state.currentStep,
          stepName: stepName || `Step ${(stepId || state.currentStep) + 1}`,
          duration,
          remainingTime: duration,
          isActive: true,
          isPaused: false,
          startedAt: timestamp,
          expiresAt
        },
        lastActiveAt: timestamp
      };
    }
    
    case COOKING_ACTIONS.UPDATE_TIMER: {
      const { remainingTime } = action.payload;
      
      if (state.timer.isActive && !state.timer.isPaused) {
        return {
          ...state,
          timer: {
            ...state.timer,
            remainingTime: Math.max(0, remainingTime)
          }
        };
      }
      return state;
    }
    
    case COOKING_ACTIONS.PAUSE_TIMER: {
      if (state.timer.isActive) {
        return {
          ...state,
          timer: {
            ...state.timer,
            isActive: false,
            isPaused: true
          },
          lastActiveAt: timestamp
        };
      }
      return state;
    }
    
    case COOKING_ACTIONS.RESUME_TIMER: {
      if (state.timer.isPaused) {
        const newExpiresAt = timestamp + (state.timer.remainingTime * 1000);
        return {
          ...state,
          timer: {
            ...state.timer,
            isActive: true,
            isPaused: false,
            startedAt: timestamp,
            expiresAt: newExpiresAt
          },
          lastActiveAt: timestamp
        };
      }
      return state;
    }
    
    case COOKING_ACTIONS.STOP_TIMER: {
      return {
        ...state,
        timer: initialCookingState.timer,
        lastActiveAt: timestamp
      };
    }
    
    case COOKING_ACTIONS.TIMER_EXPIRED: {
      return {
        ...state,
        timer: {
          ...state.timer,
          isActive: false,
          remainingTime: 0
        },
        lastActiveAt: timestamp
      };
    }
    
    case COOKING_ACTIONS.RESTORE_SESSION: {
      const { sessionData } = action.payload;
      
      // Validate and restore session data
      if (sessionData && sessionData.sessionId && sessionData.isActiveCookingSession) {
        return {
          ...state,
          ...sessionData,
          // Update last active time
          lastActiveAt: timestamp,
          // Reset timer if it was active (will need to be restarted manually)
          timer: sessionData.timer?.isActive ? {
            ...sessionData.timer,
            isActive: false,
            remainingTime: Math.max(0, sessionData.timer.remainingTime)
          } : sessionData.timer || initialCookingState.timer
        };
      }
      return state;
    }
    
    default:
      return state;
  }
}

// Create the cooking context
const CookingContext = createContext();

/**
 * CookingProvider component
 * Provides cooking state and actions to child components
 */
export function CookingProvider({ children }) {
  const [cookingState, dispatch] = useReducer(cookingReducer, initialCookingState);
  
  // Debug logging (commented out to reduce noise)
  // console.log('CookingProvider rendering, cookingState:', typeof cookingState, cookingState ? 'defined' : 'undefined');

  // Auto-save state to AsyncStorage when it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        // Add defensive check for cookingState
        if (cookingState && typeof cookingState === 'object') {
          if (cookingState.isActiveCookingSession) {
            try {
              const serializedState = JSON.stringify(cookingState);
              await AsyncStorage.setItem(COOKING_SESSION_STORAGE_KEY, serializedState);
            } catch (serializeError) {
              console.warn('Failed to serialize cooking state:', serializeError);
            }
          } else {
            // Clear storage when no active session
            await AsyncStorage.removeItem(COOKING_SESSION_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.warn('Failed to save cooking session:', error);
      }
    };

    saveState();
  }, [cookingState]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem(COOKING_SESSION_STORAGE_KEY);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          
          // Check if session is recent (within 24 hours)
          const sessionAge = Date.now() - (sessionData.lastActiveAt || 0);
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxSessionAge && sessionData.isActiveCookingSession) {
            dispatch({
              type: COOKING_ACTIONS.RESTORE_SESSION,
              payload: { sessionData }
            });
            console.log('Restored cooking session:', sessionData.recipeName);
          } else {
            // Clean up old session
            await AsyncStorage.removeItem(COOKING_SESSION_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.warn('Failed to restore cooking session:', error);
      }
    };

    restoreSession();
  }, []);

  const contextValue = {
    // State
    cookingState: cookingState || initialCookingState,
    
    // Quick access getters with fallbacks
    isActiveCookingSession: cookingState?.isActiveCookingSession || false,
    activeRecipe: cookingState?.activeRecipe || null,
    currentStep: cookingState?.currentStep || 0,
    totalSteps: cookingState?.totalSteps || 0,
    recipeName: cookingState?.recipeName || '',
    timer: cookingState?.timer || initialCookingState.timer,
    
    // Actions
    dispatch,
    
    // Convenience action creators (optional - can use dispatch directly)
    startCooking: (recipe, options = {}) => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({
          type: COOKING_ACTIONS.START_COOKING,
          payload: {
            recipe: recipe || {},
            recipeId: recipe?.id || options.recipeId,
            recipeName: recipe?.title || options.recipeName,
            totalSteps: recipe?.steps?.length || options.totalSteps,
            startStep: options.startStep
          }
        });
      }
    },
    
    endCooking: () => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({ type: COOKING_ACTIONS.END_COOKING });
      }
    },
    
    goToStep: (stepIndex) => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({
          type: COOKING_ACTIONS.GO_TO_STEP,
          payload: { stepIndex }
        });
      }
    },
    
    nextStep: () => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({
          type: COOKING_ACTIONS.UPDATE_STEP,
          payload: { direction: 'next' }
        });
      }
    },
    
    previousStep: () => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({
          type: COOKING_ACTIONS.UPDATE_STEP,
          payload: { direction: 'previous' }
        });
      }
    },
    
    startTimer: (duration, options = {}) => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({
          type: COOKING_ACTIONS.START_TIMER,
          payload: {
            stepId: options.stepId,
            stepName: options.stepName,
            duration
          }
        });
      }
    },
    
    stopTimer: () => {
      if (dispatch && typeof dispatch === 'function') {
        dispatch({ type: COOKING_ACTIONS.STOP_TIMER });
      }
    }
  };

  return (
    <CookingContext.Provider value={contextValue}>
      {children}
    </CookingContext.Provider>
  );
}

/**
 * Custom hook to use cooking context
 * Provides safe access with fallbacks
 */
export function useCooking() {
  const context = useContext(CookingContext);
  
  if (!context) {
    console.warn('useCooking: Context not available, returning default values');
    // Return safe default values instead of throwing
    return {
      cookingState: initialCookingState,
      dispatch: () => console.warn('CookingContext dispatch not available'),
      isActiveCookingSession: false,
      activeRecipe: null,
      currentStep: 0,
      totalSteps: 0,
      recipeName: '',
      timer: initialCookingState.timer,
      startCooking: () => false,
      endCooking: () => false,
      goToStep: () => false,
      nextStep: () => false,
      previousStep: () => false,
      startTimer: () => false,
      stopTimer: () => false
    };
  }
  
  return context;
}

/**
 * Custom hook for basic cooking session status
 * Returns just the essential session information
 */
export function useBasicCookingSession() {
  const { cookingState } = useCooking();
  
  return {
    isActive: cookingState.isActiveCookingSession,
    recipeName: cookingState.recipeName,
    currentStep: cookingState.currentStep,
    totalSteps: cookingState.totalSteps,
    progress: cookingState.totalSteps > 0 ? (cookingState.currentStep + 1) / cookingState.totalSteps : 0,
    timer: cookingState.timer
  };
}

export default CookingContext;