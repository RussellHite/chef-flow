/**
 * Recipe Migration Utilities
 * 
 * Handles migration of existing recipes to support ingredient amount tracking
 */

import { updateIngredientTracking } from '../services/IngredientTrackingService';

/**
 * Migrate a single recipe to the new ingredient tracking format
 * @param {Object} recipe - The recipe to migrate
 * @returns {Object} Migrated recipe with ingredient tracking
 */
export function migrateRecipeToTracking(recipe) {
  try {
    // Check if recipe already has tracking
    if (recipe.ingredientTracker && 
        recipe.steps?.some(step => step.ingredientTracking?.trackingVersion === '2.0')) {
      console.log(`Recipe "${recipe.title}" already has tracking, skipping migration`);
      return recipe;
    }

    // Ensure recipe has required fields
    if (!recipe.steps || !Array.isArray(recipe.steps)) {
      console.warn(`Recipe "${recipe.title}" has no steps, creating empty array`);
      recipe.steps = [];
    }

    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      console.warn(`Recipe "${recipe.title}" has no ingredients, creating empty array`);
      recipe.ingredients = [];
    }

    // Migrate step ingredients from text format to ID format if needed
    const migratedSteps = migrateStepIngredients(recipe.steps, recipe.ingredients);

    // Apply ingredient tracking
    const { steps: trackedSteps, ingredientTracker } = updateIngredientTracking(
      migratedSteps, 
      recipe.ingredients
    );

    const migratedRecipe = {
      ...recipe,
      steps: trackedSteps,
      ingredientTracker,
      migrationInfo: {
        migratedAt: new Date().toISOString(),
        fromVersion: recipe.version || 'legacy',
        toVersion: '2.0'
      }
    };

    console.log(`Successfully migrated recipe: "${recipe.title}"`);
    return migratedRecipe;

  } catch (error) {
    console.error(`Failed to migrate recipe "${recipe.title}":`, error);
    // Return original recipe on error to avoid data loss
    return {
      ...recipe,
      migrationError: {
        error: error.message,
        failedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Migrate step ingredients from text references to ingredient IDs
 * @param {Array} steps - Recipe steps
 * @param {Array} ingredientsList - Recipe ingredients
 * @returns {Array} Steps with migrated ingredient references
 */
function migrateStepIngredients(steps, ingredientsList) {
  return steps.map(step => {
    if (!step.ingredients || step.ingredients.length === 0) {
      return step;
    }

    const migratedIngredients = step.ingredients.map(ingredientRef => {
      // If it's already an ID reference, keep it
      if (typeof ingredientRef === 'string' && ingredientRef.startsWith('ing-')) {
        return ingredientRef;
      }

      // If it's already a tracking object, keep it
      if (typeof ingredientRef === 'object' && ingredientRef.id) {
        return ingredientRef;
      }

      // Try to match text reference to an ingredient ID
      if (typeof ingredientRef === 'string') {
        const matchingIngredient = findMatchingIngredient(ingredientRef, ingredientsList);
        return matchingIngredient ? matchingIngredient.id : ingredientRef;
      }

      // Keep unknown formats as-is
      return ingredientRef;
    });

    return {
      ...step,
      ingredients: migratedIngredients
    };
  });
}

/**
 * Find matching ingredient in the ingredients list based on text
 * @param {string} ingredientText - Text to match
 * @param {Array} ingredientsList - List of ingredients
 * @returns {Object|null} Matching ingredient or null
 */
function findMatchingIngredient(ingredientText, ingredientsList) {
  if (!ingredientText || !ingredientsList) return null;

  // Extract ingredient name from text (remove amounts and preparations)
  const textName = extractIngredientNameFromText(ingredientText);
  
  // Try exact match first
  let match = ingredientsList.find(ing => {
    const ingName = getIngredientName(ing);
    return ingName && ingName.toLowerCase() === textName.toLowerCase();
  });

  if (match) return match;

  // Try partial match (ingredient name contains text or vice versa)
  match = ingredientsList.find(ing => {
    const ingName = getIngredientName(ing);
    if (!ingName) return false;
    
    const ingNameLower = ingName.toLowerCase();
    const textNameLower = textName.toLowerCase();
    
    return ingNameLower.includes(textNameLower) || textNameLower.includes(ingNameLower);
  });

  return match || null;
}

/**
 * Extract ingredient name from text specification
 */
function extractIngredientNameFromText(text) {
  if (!text) return '';
  
  // Remove common amount patterns
  let name = text.replace(/^\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?\s+/, '');
  
  // Remove common units
  const units = ['cups?', 'tbsp?', 'tsp?', 'tablespoons?', 'teaspoons?', 'oz', 'ounces?', 
                'lbs?', 'pounds?', 'grams?', 'kg', 'ml', 'liters?', 'gallons?', 'quarts?', 
                'pints?', 'cloves?', 'pieces?', 'whole', 'medium', 'large', 'small', 
                'cans?', 'packages?', 'boxes?', 'containers?'];
  
  const unitPattern = new RegExp(`^(${units.join('|')})\\s+`, 'i');
  name = name.replace(unitPattern, '');
  
  // Take only the first part before comma (remove preparations)
  name = name.split(',')[0].trim();
  
  // Remove "divided" notation
  name = name.replace(/,?\s*divided\s*$/i, '').trim();
  
  return name;
}

/**
 * Get ingredient name from ingredient object
 */
function getIngredientName(ingredient) {
  return ingredient.structured?.ingredient?.name || 
         ingredient.displayText || 
         ingredient.originalText || 
         '';
}

/**
 * Migrate multiple recipes in batch
 * @param {Array} recipes - Array of recipes to migrate
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Object} Migration results
 */
export function migrateRecipesBatch(recipes, progressCallback) {
  if (!Array.isArray(recipes)) {
    throw new Error('Recipes must be an array');
  }

  const results = {
    total: recipes.length,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  const migratedRecipes = recipes.map((recipe, index) => {
    try {
      // Report progress
      if (progressCallback) {
        progressCallback({
          current: index + 1,
          total: recipes.length,
          recipe: recipe.title || 'Untitled'
        });
      }

      const migratedRecipe = migrateRecipeToTracking(recipe);
      
      if (migratedRecipe.migrationError) {
        results.failed++;
        results.errors.push({
          recipeTitle: recipe.title || 'Untitled',
          error: migratedRecipe.migrationError.error
        });
      } else if (migratedRecipe.migrationInfo) {
        results.migrated++;
      } else {
        results.skipped++;
      }

      return migratedRecipe;

    } catch (error) {
      results.failed++;
      results.errors.push({
        recipeTitle: recipe.title || 'Untitled',
        error: error.message
      });
      
      return recipe; // Return original on error
    }
  });

  return {
    recipes: migratedRecipes,
    results
  };
}

/**
 * Check if a recipe needs migration
 * @param {Object} recipe - Recipe to check
 * @returns {boolean} True if migration is needed
 */
export function needsMigration(recipe) {
  if (!recipe) return false;
  
  // Check if already has new tracking format
  if (recipe.ingredientTracker && 
      recipe.steps?.some(step => step.ingredientTracking?.trackingVersion === '2.0')) {
    return false;
  }
  
  // Needs migration if it has steps with ingredients but no tracking
  return recipe.steps && 
         recipe.steps.length > 0 && 
         recipe.steps.some(step => step.ingredients && step.ingredients.length > 0);
}

/**
 * Get migration statistics for a collection of recipes
 * @param {Array} recipes - Array of recipes
 * @returns {Object} Migration statistics
 */
export function getMigrationStats(recipes) {
  if (!Array.isArray(recipes)) {
    return { total: 0, needsMigration: 0, alreadyMigrated: 0 };
  }

  const stats = {
    total: recipes.length,
    needsMigration: 0,
    alreadyMigrated: 0,
    noSteps: 0
  };

  recipes.forEach(recipe => {
    if (!recipe.steps || recipe.steps.length === 0) {
      stats.noSteps++;
    } else if (needsMigration(recipe)) {
      stats.needsMigration++;
    } else {
      stats.alreadyMigrated++;
    }
  });

  return stats;
}

export default {
  migrateRecipeToTracking,
  migrateRecipesBatch,
  needsMigration,
  getMigrationStats
};