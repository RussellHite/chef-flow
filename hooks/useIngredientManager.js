/**
 * useIngredientManager Hook
 * 
 * Manages ingredient state and operations for recipe editing
 */

import { useState, useCallback } from 'react';
import { IngredientParser } from '../services/IngredientParser';
import { generateId } from '../utils/recipeUtils';

export const useIngredientManager = (initialIngredients = []) => {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [newIngredientEditing, setNewIngredientEditing] = useState(false);
  const [tempNewIngredient, setTempNewIngredient] = useState(null);

  /**
   * Add new ingredient
   */
  const addIngredient = useCallback(async (ingredientText) => {
    if (!ingredientText || typeof ingredientText !== 'string' || !ingredientText.trim()) {
      throw new Error('Valid ingredient text is required');
    }

    try {
      const newIngredient = await IngredientParser.createNewIngredient(
        ingredientText.trim(),
        generateId('ingredient')
      );

      setIngredients(prev => [newIngredient, ...prev]);
      return newIngredient;
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  }, []);

  /**
   * Edit existing ingredient
   */
  const editIngredient = useCallback(async (ingredient, newTextOrUpdatedIngredient) => {
    if (!ingredient || !ingredient.id) {
      throw new Error('Valid ingredient with ID is required');
    }

    try {
      let updatedIngredient;

      // Check if we received a full updated ingredient object (from structured editor)
      if (typeof newTextOrUpdatedIngredient === 'object' && newTextOrUpdatedIngredient.id === ingredient.id) {
        // Direct update with structured data - no re-parsing needed
        updatedIngredient = newTextOrUpdatedIngredient;
      } else if (ingredient.structured && newTextOrUpdatedIngredient) {
        // Re-parse with name preservation
        updatedIngredient = await IngredientParser.reparseIngredientWithNamePreservation(
          newTextOrUpdatedIngredient,
          ingredient
        );
      } else if (newTextOrUpdatedIngredient && newTextOrUpdatedIngredient.trim()) {
        // Simple text update with re-parsing
        updatedIngredient = await IngredientParser.reparseIngredientWithNamePreservation(
          newTextOrUpdatedIngredient.trim(),
          ingredient
        );
      } else {
        // No changes needed
        updatedIngredient = ingredient;
      }

      setIngredients(prev => 
        prev.map(ing => ing.id === ingredient.id ? updatedIngredient : ing)
      );

      return updatedIngredient;
    } catch (error) {
      console.error('Error editing ingredient:', error);
      
      // Fallback to simple text update
      const fallbackIngredient = {
        ...ingredient,
        originalText: typeof newTextOrUpdatedIngredient === 'string' 
          ? newTextOrUpdatedIngredient.trim() 
          : ingredient.originalText,
        displayText: typeof newTextOrUpdatedIngredient === 'string'
          ? newTextOrUpdatedIngredient.trim()
          : ingredient.displayText
      };
      
      setIngredients(prev => 
        prev.map(ing => ing.id === ingredient.id ? fallbackIngredient : ing)
      );

      return fallbackIngredient;
    }
  }, []);

  /**
   * Delete ingredient
   */
  const deleteIngredient = useCallback((ingredient) => {
    if (!ingredient || !ingredient.id) {
      console.warn('Cannot delete ingredient without ID');
      return;
    }

    setIngredients(prev => prev.filter(ing => ing.id !== ingredient.id));
  }, []);

  /**
   * Update ingredient structure (for manual parsing results)
   */
  const updateIngredientStructure = useCallback((ingredientId, structuredData) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === ingredientId) {
        return {
          ...ing,
          structured: structuredData,
          displayText: structuredData.isStructured 
            ? IngredientParser.formatIngredientForDisplay({ structured: structuredData })
            : ing.originalText
        };
      }
      return ing;
    }));
  }, []);

  /**
   * Start editing new ingredient
   */
  const startNewIngredientEdit = useCallback((initialText = '') => {
    setNewIngredientEditing(true);
    setTempNewIngredient({
      id: generateId('temp_ingredient'),
      originalText: initialText,
      displayText: initialText,
      structured: null,
      isNew: true
    });
  }, []);

  /**
   * Save new ingredient
   */
  const saveNewIngredient = useCallback(async (ingredientTextOrObject) => {
    // Handle both text strings and ingredient objects
    let ingredientText;
    
    if (typeof ingredientTextOrObject === 'string') {
      ingredientText = ingredientTextOrObject;
    } else if (ingredientTextOrObject && typeof ingredientTextOrObject === 'object') {
      // Extract text from ingredient object
      ingredientText = ingredientTextOrObject.displayText || ingredientTextOrObject.originalText;
    } else {
      console.warn('Invalid ingredient data provided to saveNewIngredient:', ingredientTextOrObject);
      cancelNewIngredient();
      return null;
    }

    if (!ingredientText || !ingredientText.trim()) {
      cancelNewIngredient();
      return null;
    }

    try {
      const newIngredient = await addIngredient(ingredientText.trim());
      setNewIngredientEditing(false);
      setTempNewIngredient(null);
      return newIngredient;
    } catch (error) {
      console.error('Error saving new ingredient:', error);
      throw error;
    }
  }, [addIngredient]);

  /**
   * Cancel new ingredient editing
   */
  const cancelNewIngredient = useCallback(() => {
    setNewIngredientEditing(false);
    setTempNewIngredient(null);
  }, []);

  /**
   * Replace all ingredients (for bulk updates)
   */
  const setAllIngredients = useCallback((newIngredients) => {
    setIngredients(newIngredients || []);
  }, []);

  /**
   * Find ingredient by ID
   */
  const findIngredientById = useCallback((id) => {
    return ingredients.find(ing => ing.id === id) || null;
  }, [ingredients]);

  /**
   * Get ingredient statistics
   */
  const getStats = useCallback(() => {
    const recognizedCount = ingredients.filter(ing => 
      ing.structured && ing.structured.isStructured
    ).length;
    
    return {
      total: ingredients.length,
      recognized: recognizedCount,
      needsReview: ingredients.length - recognizedCount,
      progress: ingredients.length > 0 
        ? Math.round((recognizedCount / ingredients.length) * 100)
        : 0
    };
  }, [ingredients]);

  return {
    // State
    ingredients,
    newIngredientEditing,
    tempNewIngredient,
    
    // Actions
    addIngredient,
    editIngredient,
    deleteIngredient,
    updateIngredientStructure,
    
    // New ingredient workflow
    startNewIngredientEdit,
    saveNewIngredient,
    cancelNewIngredient,
    
    // Bulk operations
    setAllIngredients,
    
    // Queries
    findIngredientById,
    getStats
  };
};