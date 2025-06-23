/**
 * Simple useCookingSession Hook (Debug Version)
 * 
 * Simplified version to isolate context issues
 */

import { useCooking } from '../contexts/CookingContext';

export function useCookingSessionSimple() {
  try {
    const context = useCooking();
    
    if (!context) {
      console.error('CookingContext is null or undefined');
      return {
        isActive: false,
        error: 'Context not available'
      };
    }

    const { cookingState } = context;
    
    if (!cookingState) {
      console.error('cookingState is null or undefined');
      return {
        isActive: false,
        error: 'cookingState not available'
      };
    }

    return {
      isActive: cookingState.isActiveCookingSession || false,
      recipeName: cookingState.recipeName || '',
      currentStep: (cookingState.currentStep || 0) + 1, // Convert to 1-based
      totalSteps: cookingState.totalSteps || 0,
      error: null
    };
  } catch (error) {
    console.error('useCookingSessionSimple error:', error);
    return {
      isActive: false,
      error: error.message
    };
  }
}