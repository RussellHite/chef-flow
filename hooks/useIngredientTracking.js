/**
 * useIngredientTracking Hook
 * 
 * React hook for easy integration of ingredient learning data collection
 * Provides convenient methods for tracking user interactions
 * Handles session management and error handling automatically
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getIngredientDataCollector } from '../services/IngredientDataCollector';
import { CONTEXT_TYPES, FEEDBACK_TYPES } from '../models/DataSchema';

export function useIngredientTracking(options = {}) {
  const {
    autoStartSession = true,
    contextType = CONTEXT_TYPES.RECIPE_CREATION,
    enableAppStateTracking = true
  } = options;

  const collectorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Initialize collector
  useEffect(() => {
    const initializeCollector = async () => {
      try {
        collectorRef.current = getIngredientDataCollector();
        
        if (autoStartSession) {
          const newSessionId = await collectorRef.current.startSession({
            contextType,
            source: 'useIngredientTracking_hook'
          });
          setSessionId(newSessionId);
        }
        
        setIsInitialized(true);
        console.log('useIngredientTracking initialized');
      } catch (error) {
        console.error('Failed to initialize ingredient tracking:', error);
      }
    };

    initializeCollector();
  }, [autoStartSession, contextType]);

  // Handle app state changes
  useEffect(() => {
    if (!enableAppStateTracking || !collectorRef.current) return;

    const handleAppStateChange = (nextAppState) => {
      collectorRef.current.trackAppStateChange(nextAppState, AppState.currentState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [enableAppStateTracking]);

  // Update analytics periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateAnalytics = () => {
      const sessionAnalytics = collectorRef.current?.getCurrentSessionAnalytics();
      setAnalytics(sessionAnalytics);
    };

    updateAnalytics();
    const interval = setInterval(updateAnalytics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized, sessionId]);

  /**
   * Track ingredient search interaction
   */
  const trackSearch = useCallback(async (query, results = [], context = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackIngredientSearch(query, results, {
        contextType,
        ...context
      });
    } catch (error) {
      console.error('Failed to track search:', error);
      return false;
    }
  }, [contextType]);

  /**
   * Track ingredient selection
   */
  const trackSelection = useCallback(async (ingredient, context = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackIngredientSelection(ingredient, {
        contextType,
        ...context
      });
    } catch (error) {
      console.error('Failed to track selection:', error);
      return false;
    }
  }, [contextType]);

  /**
   * Track ingredient deselection
   */
  const trackDeselection = useCallback(async (ingredient, context = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      // Track as a selection event with deselection flag
      return await collectorRef.current.trackIngredientSelection(ingredient, {
        contextType,
        isDeselection: true,
        ...context
      });
    } catch (error) {
      console.error('Failed to track deselection:', error);
      return false;
    }
  }, [contextType]);

  /**
   * Track ingredient correction (valuable for ML training)
   */
  const trackCorrection = useCallback(async (original, corrected, correctionType = 'name') => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackIngredientCorrection(
        original, 
        corrected, 
        correctionType
      );
    } catch (error) {
      console.error('Failed to track correction:', error);
      return false;
    }
  }, []);

  /**
   * Track ingredient combination
   */
  const trackCombination = useCallback(async (ingredients, context = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackIngredientCombination(ingredients, {
        contextType,
        ...context
      });
    } catch (error) {
      console.error('Failed to track combination:', error);
      return false;
    }
  }, [contextType]);

  /**
   * Track user feedback on ingredients
   */
  const trackFeedback = useCallback(async (ingredient, feedbackType, rating = null, context = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackUserFeedback(
        ingredient, 
        feedbackType, 
        rating, 
        {
          contextType,
          ...context
        }
      );
    } catch (error) {
      console.error('Failed to track feedback:', error);
      return false;
    }
  }, [contextType]);

  /**
   * Track quantity change
   */
  const trackQuantityChange = useCallback(async (ingredient, oldQuantity, newQuantity, context = {}) => {
    return trackCorrection(
      { ...ingredient, quantity: oldQuantity },
      { ...ingredient, quantity: newQuantity },
      'quantity'
    );
  }, [trackCorrection]);

  /**
   * Track unit change
   */
  const trackUnitChange = useCallback(async (ingredient, oldUnit, newUnit, context = {}) => {
    return trackCorrection(
      { ...ingredient, unit: oldUnit },
      { ...ingredient, unit: newUnit },
      'unit'
    );
  }, [trackCorrection]);

  /**
   * Track preparation method change
   */
  const trackPreparationChange = useCallback(async (ingredient, oldPrep, newPrep, context = {}) => {
    return trackCorrection(
      { ...ingredient, preparation: oldPrep },
      { ...ingredient, preparation: newPrep },
      'preparation'
    );
  }, [trackCorrection]);

  /**
   * Track multiple interactions in batch
   */
  const trackBatch = useCallback(async (interactions) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      return await collectorRef.current.trackBatch(interactions);
    } catch (error) {
      console.error('Failed to track batch:', error);
      return false;
    }
  }, []);

  /**
   * Start a new tracking session
   */
  const startSession = useCallback(async (sessionContext = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return null;
    }

    try {
      const newSessionId = await collectorRef.current.startSession({
        contextType,
        ...sessionContext
      });
      setSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [contextType]);

  /**
   * End the current tracking session
   */
  const endSession = useCallback(async () => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return false;
    }

    try {
      await collectorRef.current.endSession();
      setSessionId(null);
      setAnalytics(null);
      return true;
    } catch (error) {
      console.error('Failed to end session:', error);
      return false;
    }
  }, []);

  /**
   * Get current session analytics
   */
  const getSessionAnalytics = useCallback(() => {
    if (!collectorRef.current) {
      return null;
    }

    return collectorRef.current.getCurrentSessionAnalytics();
  }, []);

  /**
   * Export tracking data
   */
  const exportData = useCallback(async (options = {}) => {
    if (!collectorRef.current) {
      console.warn('Ingredient tracker not initialized');
      return null;
    }

    try {
      return await collectorRef.current.exportData(options);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }, []);

  return {
    // State
    isInitialized,
    sessionId,
    analytics,
    
    // Tracking methods
    trackSearch,
    trackSelection,
    trackDeselection,
    trackCorrection,
    trackCombination,
    trackFeedback,
    trackQuantityChange,
    trackUnitChange,
    trackPreparationChange,
    trackBatch,
    
    // Session management
    startSession,
    endSession,
    getSessionAnalytics,
    
    // Data management
    exportData,
    
    // Utilities
    CONTEXT_TYPES,
    FEEDBACK_TYPES
  };
}

/**
 * Specialized hook for search tracking
 */
export function useIngredientSearchTracking() {
  const { trackSearch, trackSelection, isInitialized } = useIngredientTracking({
    contextType: CONTEXT_TYPES.RECIPE_CREATION
  });

  const trackSearchWithResults = useCallback(async (query, results, selectedIngredient = null) => {
    // Track the search
    await trackSearch(query, results, {
      searchStartTime: Date.now()
    });

    // If user selected an ingredient, track that too
    if (selectedIngredient) {
      await trackSelection(selectedIngredient, {
        fromSearch: true,
        searchQuery: query,
        searchResults: results.length,
        selectionRank: results.findIndex(r => r.id === selectedIngredient.id) + 1
      });
    }
  }, [trackSearch, trackSelection]);

  return {
    isInitialized,
    trackSearchWithResults,
    trackSearch,
    trackSelection
  };
}

/**
 * Specialized hook for recipe creation tracking
 */
export function useRecipeCreationTracking() {
  const tracking = useIngredientTracking({
    contextType: CONTEXT_TYPES.RECIPE_CREATION
  });

  const trackIngredientAdded = useCallback(async (ingredient, recipeContext = {}) => {
    return tracking.trackSelection(ingredient, {
      recipeId: recipeContext.recipeId,
      recipeName: recipeContext.recipeName,
      totalIngredients: recipeContext.totalIngredients,
      selectionOrder: recipeContext.selectionOrder
    });
  }, [tracking]);

  const trackIngredientRemoved = useCallback(async (ingredient, recipeContext = {}) => {
    return tracking.trackDeselection(ingredient, {
      recipeId: recipeContext.recipeId,
      recipeName: recipeContext.recipeName,
      removalReason: recipeContext.reason
    });
  }, [tracking]);

  const trackRecipeCompleted = useCallback(async (ingredients, recipeData = {}) => {
    return tracking.trackCombination(ingredients, {
      recipeName: recipeData.name,
      recipeId: recipeData.id,
      cuisineType: recipeData.cuisine,
      mealType: recipeData.mealType,
      difficulty: recipeData.difficulty,
      estimatedTime: recipeData.estimatedTime,
      isComplete: true
    });
  }, [tracking]);

  return {
    ...tracking,
    trackIngredientAdded,
    trackIngredientRemoved,
    trackRecipeCompleted
  };
}

/**
 * Specialized hook for cooking session tracking
 */
export function useCookingTracking() {
  const tracking = useIngredientTracking({
    contextType: CONTEXT_TYPES.COOKING_SESSION
  });

  const trackCookingStarted = useCallback(async (recipe) => {
    await tracking.startSession({
      contextType: CONTEXT_TYPES.COOKING_SESSION,
      recipeId: recipe.id,
      recipeName: recipe.title
    });

    return tracking.trackCombination(recipe.ingredients || [], {
      recipeName: recipe.title,
      recipeId: recipe.id,
      cookingStarted: true
    });
  }, [tracking]);

  const trackIngredientUsed = useCallback(async (ingredient, step = null) => {
    return tracking.trackSelection(ingredient, {
      cookingStep: step,
      isActualUsage: true
    });
  }, [tracking]);

  const trackSubstitution = useCallback(async (original, substitute, reason = '') => {
    return tracking.trackCorrection(original, substitute, 'substitution');
  }, [tracking]);

  return {
    ...tracking,
    trackCookingStarted,
    trackIngredientUsed,
    trackSubstitution
  };
}

export default useIngredientTracking;