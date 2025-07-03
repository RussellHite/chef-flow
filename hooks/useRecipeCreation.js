/**
 * useRecipeCreation Hook
 * 
 * Manages recipe creation state and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { parseRecipe } from '../utils/recipeParser';
import { useRecipeCreationTracking } from './useIngredientTracking';

export const useRecipeCreation = (navigation, options = {}) => {
  // Form state
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize ingredient tracking for recipe creation
  const tracking = useRecipeCreationTracking();
  
  // Form validation
  const isFormValid = useMemo(() => 
    recipeTitle.trim().length > 0 && 
    ingredients.trim().length > 0 && 
    steps.trim().length > 0,
    [recipeTitle, ingredients, steps]
  );
  
  // Check if user has unsaved changes
  const hasUnsavedChanges = useMemo(() => 
    recipeTitle.trim() || ingredients.trim() || steps.trim(),
    [recipeTitle, ingredients, steps]
  );
  
  /**
   * Process recipe and navigate to edit screen
   */
  const processRecipe = useCallback(async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    
    try {
      // Parse recipe with separate ingredients and steps
      const parsedRecipe = await parseRecipe(recipeTitle, steps, ingredients);
      
      // Track recipe creation with parsed ingredients
      if (tracking.isInitialized && parsedRecipe.ingredients) {
        await tracking.trackRecipeCompleted(parsedRecipe.ingredients, {
          name: recipeTitle,
          id: parsedRecipe.id || `recipe_${Date.now()}`,
          totalIngredients: parsedRecipe.ingredients.length,
          totalSteps: parsedRecipe.steps?.length || 0,
          isComplete: false, // Recipe creation started, not completed
          source: 'recipe_creation'
        });
      }
      
      // Navigate to recipe editing screen with parsed data and original content
      navigation.navigate('EditRecipe', { 
        recipe: parsedRecipe,
        originalContent: {
          ingredients: ingredients,
          steps: steps
        },
        isNew: true 
      });
    } catch (error) {
      console.error('Recipe parsing error:', error);
      Alert.alert('Error', 'Failed to process recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [isFormValid, recipeTitle, steps, ingredients, tracking, navigation]);
  
  /**
   * Handle cancel with unsaved changes confirmation
   */
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard Recipe?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasUnsavedChanges, navigation]);
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setRecipeTitle('');
    setIngredients('');
    setSteps('');
  }, []);
  
  /**
   * Update specific form field
   */
  const updateField = useCallback((field, value) => {
    switch (field) {
      case 'title':
        setRecipeTitle(value);
        break;
      case 'ingredients':
        setIngredients(value);
        break;
      case 'steps':
        setSteps(value);
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }
  }, []);
  
  /**
   * Get form data as object
   */
  const getFormData = useCallback(() => ({
    title: recipeTitle,
    ingredients,
    steps
  }), [recipeTitle, ingredients, steps]);

  return {
    // State
    recipeTitle,
    ingredients,
    steps,
    isProcessing,
    
    // Computed values
    isFormValid,
    hasUnsavedChanges,
    
    // Actions
    setRecipeTitle,
    setIngredients,
    setSteps,
    processRecipe,
    handleCancel,
    resetForm,
    updateField,
    getFormData,
    
    // Tracking
    tracking
  };
};