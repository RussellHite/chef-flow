/**
 * Recipe Utility Functions
 * 
 * Helper functions for recipe calculations and formatting
 */

/**
 * Calculate parsing progress percentage for ingredients
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} Progress percentage (0-100)
 */
export const calculateParsingProgress = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }
  
  const recognizedCount = ingredients.filter(ing => 
    ing.structured && ing.structured.isStructured
  ).length;
  
  return Math.round((recognizedCount / ingredients.length) * 100);
};

/**
 * Get count of recognized ingredients
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} Number of recognized ingredients
 */
export const getRecognizedIngredientsCount = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }
  
  return ingredients.filter(ing => 
    ing.structured && ing.structured.isStructured
  ).length;
};

/**
 * Get count of ingredients that need review
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} Number of ingredients needing review
 */
export const getNeedsReviewCount = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }
  
  const recognizedCount = getRecognizedIngredientsCount(ingredients);
  return ingredients.length - recognizedCount;
};

/**
 * Calculate total estimated cooking time from steps
 * @param {Array} steps - Array of step objects
 * @returns {number} Total time in minutes
 */
export const calculateTotalTime = (steps) => {
  if (!steps || steps.length === 0) {
    return 0;
  }
  
  // Simple heuristic: assume each step takes 5 minutes on average
  // In a real app, you might parse time from step content
  return steps.length * 5;
};

/**
 * Format quantity for display (convert decimals to fractions when appropriate)
 * @param {number} quantity - Numeric quantity
 * @returns {string} Formatted quantity string
 */
export const formatQuantity = (quantity) => {
  if (!quantity || typeof quantity !== 'number') {
    return '';
  }
  
  // Common cooking fractions
  const fractions = {
    0.125: '1/8',
    0.25: '1/4',
    0.333: '1/3',
    0.5: '1/2',
    0.667: '2/3',
    0.75: '3/4'
  };
  
  const whole = Math.floor(quantity);
  const decimal = quantity - whole;
  
  // Check if decimal part matches a common fraction
  for (const [value, fraction] of Object.entries(fractions)) {
    if (Math.abs(decimal - value) < 0.02) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }
  
  // Return as decimal or whole number
  return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
};

/**
 * Generate unique ID for recipe elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate recipe data before saving
 * @param {Object} recipe - Recipe object to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateRecipe = (recipe) => {
  const errors = [];
  
  if (!recipe.title || recipe.title.trim().length === 0) {
    errors.push('Recipe title is required');
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }
  
  if (!recipe.steps || recipe.steps.length === 0) {
    errors.push('At least one step is required');
  }
  
  if (recipe.servings && (recipe.servings < 1 || recipe.servings > 100)) {
    errors.push('Servings must be between 1 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};