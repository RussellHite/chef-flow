/**
 * useIngredientList Hook
 * 
 * Manages ingredient list data loading and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import ingredientService from '../services/ingredientServiceInstance';

export const useIngredientList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load ingredients and categories from service
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all ingredients and categories
      const [allIngredients, allCategories] = await Promise.all([
        ingredientService.searchIngredients('', 1000), // Get all ingredients
        ingredientService.getCategories(),
      ]);
      
      setIngredients(allIngredients);
      setCategories([{ id: 'all', name: 'All Categories' }, ...allCategories]);
    } catch (error) {
      console.error('Error loading ingredient data:', error);
      setError('Failed to load ingredient data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing ingredient
   */
  const updateIngredient = useCallback(async (ingredientId, updatedData) => {
    try {
      // Update in the ingredients array
      setIngredients(prev => prev.map(ingredient => 
        ingredient.id === ingredientId 
          ? { ...ingredient, ...updatedData }
          : ingredient
      ));
      
      // Here you would typically also save to the backend
      // await ingredientService.updateIngredient(ingredientId, updatedData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating ingredient:', error);
      
      // Revert the optimistic update
      await loadData();
      
      return { 
        success: false, 
        error: 'Failed to update ingredient' 
      };
    }
  }, [loadData]);

  /**
   * Delete an ingredient
   */
  const deleteIngredient = useCallback(async (ingredientId) => {
    try {
      // Optimistically remove from state
      setIngredients(prev => prev.filter(ingredient => ingredient.id !== ingredientId));
      
      // Here you would typically also delete from the backend
      // await ingredientService.deleteIngredient(ingredientId);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      
      // Revert the optimistic update
      await loadData();
      
      return { 
        success: false, 
        error: 'Failed to delete ingredient' 
      };
    }
  }, [loadData]);

  /**
   * Add a new ingredient
   */
  const addIngredient = useCallback(async (ingredientData) => {
    try {
      // Here you would typically save to the backend first
      // const newIngredient = await ingredientService.addIngredient(ingredientData);
      
      // For now, create a mock ingredient
      const newIngredient = {
        id: `ingredient_${Date.now()}`,
        ...ingredientData,
        createdAt: new Date().toISOString()
      };
      
      setIngredients(prev => [...prev, newIngredient]);
      
      return { 
        success: true, 
        ingredient: newIngredient 
      };
    } catch (error) {
      console.error('Error adding ingredient:', error);
      return { 
        success: false, 
        error: 'Failed to add ingredient' 
      };
    }
  }, []);

  /**
   * Get ingredient by ID
   */
  const getIngredientById = useCallback((id) => {
    return ingredients.find(ingredient => ingredient.id === id) || null;
  }, [ingredients]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((id) => {
    return categories.find(category => category.id === id) || null;
  }, [categories]);

  /**
   * Get ingredients by category
   */
  const getIngredientsByCategory = useCallback((categoryId) => {
    if (categoryId === 'all') {
      return ingredients;
    }
    return ingredients.filter(ingredient => ingredient.category === categoryId);
  }, [ingredients]);

  /**
   * Get ingredient statistics
   */
  const getStats = useCallback(() => {
    const totalIngredients = ingredients.length;
    const categoryCounts = categories.reduce((acc, category) => {
      if (category.id === 'all') return acc;
      
      acc[category.id] = ingredients.filter(
        ingredient => ingredient.category === category.id
      ).length;
      
      return acc;
    }, {});

    return {
      total: totalIngredients,
      byCategory: categoryCounts,
      categoriesCount: categories.length - 1 // Exclude 'all' category
    };
  }, [ingredients, categories]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    ingredients,
    categories,
    loading,
    error,
    
    // Actions
    updateIngredient,
    deleteIngredient,
    addIngredient,
    refresh,
    
    // Queries
    getIngredientById,
    getCategoryById,
    getIngredientsByCategory,
    getStats
  };
};