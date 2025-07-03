/**
 * useRecipeEditor Hook
 * 
 * Manages core recipe state and operations for recipe editing
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { validateRecipe } from '../utils/recipeUtils';

export const useRecipeEditor = (initialRecipe, isNew = false, options = {}) => {
  const {
    onSave,
    onDelete,
    onCancel,
    navigation
  } = options;

  // Core recipe state
  const [recipe, setRecipe] = useState(initialRecipe);
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasChanges = (
      title !== (initialRecipe?.title || '') ||
      servings !== (initialRecipe?.servings || 4) ||
      JSON.stringify(recipe?.ingredients) !== JSON.stringify(initialRecipe?.ingredients) ||
      JSON.stringify(recipe?.steps) !== JSON.stringify(initialRecipe?.steps)
    );
    
    setHasUnsavedChanges(hasChanges);
  }, [title, servings, recipe, initialRecipe]);

  /**
   * Update recipe title
   */
  const updateTitle = useCallback((newTitle) => {
    setTitle(newTitle);
    setRecipe(prev => ({
      ...prev,
      title: newTitle
    }));
  }, []);

  /**
   * Update servings count
   */
  const updateServings = useCallback((newServings) => {
    const servingsNum = parseInt(newServings, 10);
    if (servingsNum >= 1 && servingsNum <= 100) {
      setServings(servingsNum);
      setRecipe(prev => ({
        ...prev,
        servings: servingsNum
      }));
    }
  }, []);

  /**
   * Update recipe ingredients
   */
  const updateIngredients = useCallback((newIngredients) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  }, []);

  /**
   * Update recipe steps
   */
  const updateSteps = useCallback((newSteps) => {
    setRecipe(prev => ({
      ...prev,
      steps: newSteps
    }));
  }, []);

  /**
   * Update entire recipe
   */
  const updateRecipe = useCallback((updates) => {
    setRecipe(prev => ({
      ...prev,
      ...updates,
      title: updates.title || title,
      servings: updates.servings || servings
    }));
    
    // Update individual state if needed
    if (updates.title && updates.title !== title) {
      setTitle(updates.title);
    }
    if (updates.servings && updates.servings !== servings) {
      setServings(updates.servings);
    }
  }, [title, servings]);

  /**
   * Save recipe
   */
  const saveRecipe = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    
    try {
      // Build complete recipe object
      const completeRecipe = {
        ...recipe,
        title: title.trim() || 'Untitled Recipe',
        servings,
        updatedAt: new Date().toISOString()
      };

      // Validate recipe
      const validation = validateRecipe(completeRecipe);
      if (!validation.isValid) {
        Alert.alert(
          'Validation Error',
          validation.errors.join('\n'),
          [{ text: 'OK' }]
        );
        return false;
      }

      // Call save handler
      if (onSave) {
        await onSave(completeRecipe);
      }

      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert(
        'Save Error',
        'Failed to save recipe. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [recipe, title, servings, isSaving, onSave]);

  /**
   * Delete recipe
   */
  const deleteRecipe = useCallback(async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Delete Recipe',
        'Are you sure you want to delete this recipe? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                if (onDelete) {
                  await onDelete(recipe);
                }
                setHasUnsavedChanges(false);
                resolve(true);
              } catch (error) {
                console.error('Error deleting recipe:', error);
                Alert.alert('Error', 'Failed to delete recipe. Please try again.');
                resolve(false);
              }
            }
          }
        ]
      );
    });
  }, [recipe, onDelete]);

  /**
   * Cancel editing with unsaved changes check
   */
  const cancelEditing = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          {
            text: 'Stay',
            style: 'cancel'
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setHasUnsavedChanges(false);
              if (onCancel) {
                onCancel();
              } else if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } else {
      if (onCancel) {
        onCancel();
      } else if (navigation) {
        navigation.goBack();
      }
    }
  }, [hasUnsavedChanges, onCancel, navigation]);

  /**
   * Reset recipe to initial state
   */
  const resetRecipe = useCallback(() => {
    setRecipe(initialRecipe);
    setTitle(initialRecipe?.title || '');
    setServings(initialRecipe?.servings || 4);
    setHasUnsavedChanges(false);
  }, [initialRecipe]);

  /**
   * Get recipe validation status
   */
  const getValidation = useCallback(() => {
    const completeRecipe = {
      ...recipe,
      title: title.trim() || 'Untitled Recipe',
      servings
    };
    
    return validateRecipe(completeRecipe);
  }, [recipe, title, servings]);

  return {
    // State
    recipe,
    title,
    servings,
    isSaving,
    hasUnsavedChanges,
    isNew,
    
    // Actions
    updateTitle,
    updateServings,
    updateIngredients,
    updateSteps,
    updateRecipe,
    saveRecipe,
    deleteRecipe,
    cancelEditing,
    resetRecipe,
    
    // Setters for direct state updates
    setTitle,
    setServings,
    setRecipe,
    
    // Queries
    getValidation
  };
};