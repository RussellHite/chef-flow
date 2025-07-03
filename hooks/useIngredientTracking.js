/**
 * useIngredientTracking Hook - Simplified version
 * 
 * Previously provided ingredient data collection and user interaction tracking.
 * Data collection features have been removed, this now provides minimal interface
 * for backwards compatibility.
 */

import { useEffect, useState } from 'react';

export function useIngredientTracking(options = {}) {
  const [sessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(true);

  useEffect(() => {
    // Data collection removed - immediately mark as initialized
    setIsInitialized(true);
  }, []);

  // No-op tracking functions for backwards compatibility
  const trackIngredientParsing = () => {};
  const trackIngredientEdit = () => {};
  const trackIngredientSelection = () => {};
  const trackUserFeedback = () => {};
  const trackRecipeCreation = () => {};
  const trackRecipeCompleted = () => {};
  const trackCorrection = () => {};
  const trackIngredientRemoved = () => {};
  const trackIngredientAdded = () => {};
  const trackCookingStep = () => {};
  const trackCookingStarted = () => {};
  const trackError = () => {};
  const getSessionData = () => null;
  const endSession = () => {};

  return {
    sessionId,
    isInitialized,
    trackIngredientParsing,
    trackIngredientEdit,
    trackIngredientSelection,
    trackUserFeedback,
    trackRecipeCreation,
    trackRecipeCompleted,
    trackCorrection,
    trackIngredientRemoved,
    trackIngredientAdded,
    trackCookingStep,
    trackCookingStarted,
    trackError,
    getSessionData,
    endSession
  };
}

export function useRecipeCreationTracking() {
  return useIngredientTracking({
    contextType: 'recipe_creation',
    autoStartSession: true,
    enableAppStateTracking: false
  });
}

export function useCookingTracking() {
  return useIngredientTracking({
    contextType: 'cooking',
    autoStartSession: true,
    enableAppStateTracking: true
  });
}