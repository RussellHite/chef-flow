/**
 * RecipeCreationService
 * 
 * Handles recipe creation business logic and validation
 */

import { parseRecipe } from '../utils/recipeParser';

export class RecipeCreationService {
  /**
   * Create recipe from form input
   * @param {string} title - Recipe title
   * @param {string} ingredients - Raw ingredients text
   * @param {string} steps - Raw steps text
   * @param {Object} trackingService - Optional tracking service
   * @returns {Promise<Object>} Parsed recipe object
   */
  static async createRecipe(title, ingredients, steps, trackingService = null) {
    try {
      // Validate input
      const validation = this.validateRecipeInput(title, ingredients, steps);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Parse recipe with separate ingredients and steps
      const parsedRecipe = await parseRecipe(title.trim(), steps.trim(), ingredients.trim());
      
      // Track recipe creation if tracking service provided
      if (trackingService && trackingService.isInitialized && parsedRecipe.ingredients) {
        await trackingService.trackRecipeCompleted(parsedRecipe.ingredients, {
          name: title.trim(),
          id: parsedRecipe.id || `recipe_${Date.now()}`,
          totalIngredients: parsedRecipe.ingredients.length,
          totalSteps: parsedRecipe.steps?.length || 0,
          isComplete: false, // Recipe creation started, not completed
          source: 'recipe_creation'
        });
      }
      
      return {
        success: true,
        recipe: parsedRecipe,
        originalContent: {
          ingredients: ingredients.trim(),
          steps: steps.trim()
        }
      };
    } catch (error) {
      console.error('Recipe creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create recipe'
      };
    }
  }

  /**
   * Validate recipe input data
   * @param {string} title - Recipe title
   * @param {string} ingredients - Ingredients text
   * @param {string} steps - Steps text
   * @returns {Object} Validation result
   */
  static validateRecipeInput(title, ingredients, steps) {
    const errors = [];
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Recipe title is required');
    } else if (title.trim().length < 3) {
      errors.push('Recipe title must be at least 3 characters');
    } else if (title.trim().length > 100) {
      errors.push('Recipe title must be less than 100 characters');
    }
    
    if (!ingredients || typeof ingredients !== 'string' || ingredients.trim().length === 0) {
      errors.push('Ingredients are required');
    } else if (ingredients.trim().length < 10) {
      errors.push('Please provide more detailed ingredients');
    }
    
    if (!steps || typeof steps !== 'string' || steps.trim().length === 0) {
      errors.push('Cooking steps are required');
    } else if (steps.trim().length < 20) {
      errors.push('Please provide more detailed cooking steps');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user should see discard confirmation
   * @param {string} title - Recipe title
   * @param {string} ingredients - Ingredients text
   * @param {string} steps - Steps text
   * @returns {boolean} True if confirmation should be shown
   */
  static shouldShowDiscardConfirmation(title, ingredients, steps) {
    return !!(title && title.trim()) || 
           !!(ingredients && ingredients.trim()) || 
           !!(steps && steps.trim());
  }

  /**
   * Format form data for processing
   * @param {Object} formData - Raw form data
   * @returns {Object} Formatted form data
   */
  static formatFormData(formData) {
    return {
      title: (formData.title || '').trim(),
      ingredients: (formData.ingredients || '').trim(),
      steps: (formData.steps || '').trim()
    };
  }

  /**
   * Get form completion percentage
   * @param {string} title - Recipe title
   * @param {string} ingredients - Ingredients text
   * @param {string} steps - Steps text
   * @returns {number} Completion percentage (0-100)
   */
  static getFormCompletionPercentage(title, ingredients, steps) {
    let completed = 0;
    let total = 3;
    
    if (title && title.trim().length > 0) completed++;
    if (ingredients && ingredients.trim().length > 0) completed++;
    if (steps && steps.trim().length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }

  /**
   * Suggest improvements for recipe input
   * @param {string} title - Recipe title
   * @param {string} ingredients - Ingredients text
   * @param {string} steps - Steps text
   * @returns {Array} Array of suggestion strings
   */
  static getSuggestions(title, ingredients, steps) {
    const suggestions = [];
    
    if (title && title.trim().length > 0 && title.trim().length < 10) {
      suggestions.push('Consider adding more descriptive words to your recipe title');
    }
    
    if (ingredients && ingredients.trim().length > 0) {
      const ingredientLines = ingredients.trim().split('\n').filter(line => line.trim());
      if (ingredientLines.length < 3) {
        suggestions.push('Most recipes benefit from having at least 3-4 ingredients');
      }
    }
    
    if (steps && steps.trim().length > 0) {
      const stepLines = steps.trim().split('\n').filter(line => line.trim());
      if (stepLines.length < 2) {
        suggestions.push('Break down your cooking process into multiple steps for clarity');
      }
    }
    
    return suggestions;
  }
}