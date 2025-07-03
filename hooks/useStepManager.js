/**
 * useStepManager Hook
 * 
 * Manages recipe steps state and operations
 */

import { useState, useCallback } from 'react';
import { generateId } from '../utils/recipeUtils';
import { RecipeContentSyncService } from '../services/RecipeContentSyncService';

export const useStepManager = (initialSteps = [], options = {}) => {
  const { onStepsChange } = options;
  
  const [steps, setSteps] = useState(initialSteps);
  const [originalStepContent, setOriginalStepContent] = useState(new Map());

  // Notify parent of changes
  const notifyChange = useCallback((newSteps) => {
    if (onStepsChange) {
      onStepsChange(newSteps);
    }
  }, [onStepsChange]);

  /**
   * Add new step
   */
  const addStep = useCallback((content = '', position = null) => {
    const newStep = {
      id: generateId('step'),
      content: content.trim() || 'New step',
      ingredients: [],
      timing: null,
      temperature: null,
      order: position !== null ? position : steps.length
    };

    const newSteps = position !== null 
      ? [
          ...steps.slice(0, position),
          newStep,
          ...steps.slice(position).map(step => ({ ...step, order: step.order + 1 }))
        ]
      : [...steps, newStep];

    setSteps(newSteps);
    
    // Store original content
    setOriginalStepContent(prev => new Map(prev).set(newStep.id, newStep.content));
    
    notifyChange(newSteps);
    return newStep;
  }, [steps, notifyChange]);

  /**
   * Update step content
   */
  const updateStep = useCallback((stepId, updates) => {
    const newSteps = steps.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, ...updates };
        
        // Update original content map if content changed
        if (updates.content !== undefined) {
          setOriginalStepContent(prev => {
            const newMap = new Map(prev);
            if (!newMap.has(stepId)) {
              newMap.set(stepId, step.content);
            }
            return newMap;
          });
        }
        
        return updatedStep;
      }
      return step;
    });

    setSteps(newSteps);
    notifyChange(newSteps);
  }, [steps, notifyChange]);

  /**
   * Delete step
   */
  const deleteStep = useCallback((stepId) => {
    const newSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }));

    setSteps(newSteps);
    
    // Remove from original content map
    setOriginalStepContent(prev => {
      const newMap = new Map(prev);
      newMap.delete(stepId);
      return newMap;
    });
    
    notifyChange(newSteps);
  }, [steps, notifyChange]);

  /**
   * Reorder steps
   */
  const reorderSteps = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= steps.length || toIndex >= steps.length) {
      return;
    }

    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    // Update order indices
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }));

    setSteps(reorderedSteps);
    notifyChange(reorderedSteps);
  }, [steps, notifyChange]);

  /**
   * Add step from ingredient action
   */
  const addStepFromAction = useCallback((action, ingredientId, position = null) => {
    if (!action || !ingredientId) return null;

    const stepContent = RecipeContentSyncService.createStepFromAction(action, { id: ingredientId });
    
    const newStep = {
      id: generateId('step'),
      content: stepContent || `${action} ingredient`,
      ingredients: [ingredientId],
      timing: null,
      temperature: null,
      order: position !== null ? position : steps.length,
      isActionGenerated: true,
      sourceIngredientId: ingredientId
    };

    const newSteps = position !== null 
      ? [
          ...steps.slice(0, position),
          newStep,
          ...steps.slice(position).map(step => ({ ...step, order: step.order + 1 }))
        ]
      : [...steps, newStep];

    setSteps(newSteps);
    
    // Store original content
    setOriginalStepContent(prev => new Map(prev).set(newStep.id, newStep.content));
    
    notifyChange(newSteps);
    return newStep;
  }, [steps, notifyChange]);

  /**
   * Update step ingredients
   */
  const updateStepIngredients = useCallback((stepId, ingredients) => {
    updateStep(stepId, { ingredients });
  }, [updateStep]);

  /**
   * Synchronize steps with ingredient changes
   */
  const syncWithIngredients = useCallback((ingredients) => {
    if (!ingredients || ingredients.length === 0) return;

    const updatedSteps = RecipeContentSyncService.updateAllStepsContent(
      steps,
      ingredients,
      originalStepContent
    );

    setSteps(updatedSteps);
    notifyChange(updatedSteps);
  }, [steps, originalStepContent, notifyChange]);

  /**
   * Replace all steps
   */
  const setAllSteps = useCallback((newSteps) => {
    setSteps(newSteps || []);
    
    // Update original content map
    const newOriginalContent = new Map();
    (newSteps || []).forEach(step => {
      if (!originalStepContent.has(step.id)) {
        newOriginalContent.set(step.id, step.content);
      } else {
        newOriginalContent.set(step.id, originalStepContent.get(step.id));
      }
    });
    setOriginalStepContent(newOriginalContent);
    
    notifyChange(newSteps || []);
  }, [originalStepContent, notifyChange]);

  /**
   * Find step by ID
   */
  const findStepById = useCallback((id) => {
    return steps.find(step => step.id === id) || null;
  }, [steps]);

  /**
   * Get step statistics
   */
  const getStats = useCallback(() => {
    const totalTime = steps.reduce((total, step) => {
      const timing = step.timing || 0;
      return total + (typeof timing === 'number' ? timing : 0);
    }, 0);

    return {
      total: steps.length,
      totalTime,
      averageTime: steps.length > 0 ? Math.round(totalTime / steps.length) : 0,
      withIngredients: steps.filter(step => step.ingredients && step.ingredients.length > 0).length,
      actionGenerated: steps.filter(step => step.isActionGenerated).length
    };
  }, [steps]);

  /**
   * Clear original content (for reset scenarios)
   */
  const clearOriginalContent = useCallback(() => {
    setOriginalStepContent(new Map());
  }, []);

  return {
    // State
    steps,
    originalStepContent,
    
    // Actions
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    addStepFromAction,
    updateStepIngredients,
    syncWithIngredients,
    
    // Bulk operations
    setAllSteps,
    clearOriginalContent,
    
    // Queries
    findStepById,
    getStats
  };
};