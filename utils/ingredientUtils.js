/**
 * Ingredient Utility Functions
 * 
 * Helper functions for ingredient parsing and manipulation
 */

/**
 * Extract amount (quantity + unit) from ingredient text
 * @param {string} ingredientText - Raw ingredient text
 * @returns {string} Amount portion (e.g., "2 cups")
 */
export const extractAmount = (ingredientText) => {
  const match = ingredientText.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)/i);
  return match ? `${match[1]} ${match[2]}` : '';
};

/**
 * Extract ingredient name from ingredient text (after quantity and unit)
 * @param {string} ingredientText - Raw ingredient text
 * @returns {string} Ingredient name portion
 */
export const extractName = (ingredientText) => {
  const match = ingredientText.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)\s+(.+)/i);
  return match ? match[3] : ingredientText;
};

/**
 * Get ingredient name from structured or unstructured ingredient
 * @param {Object} ingredient - Ingredient object
 * @returns {string} Ingredient name
 */
export const getIngredientName = (ingredient) => {
  if (!ingredient || typeof ingredient !== 'object') {
    console.warn('getIngredientName: Invalid ingredient object');
    return 'ingredient';
  }
  
  let name;
  if (ingredient.structured?.ingredient?.name) {
    name = ingredient.structured.ingredient.name;
  } else {
    name = ingredient.originalText || ingredient.displayText || 'ingredient';
  }
  
  // Ensure we always return a string
  if (typeof name !== 'string') {
    console.error('getIngredientName: Non-string name detected:', typeof name, name);
    return String(name || 'ingredient');
  }
  
  return name;
};

/**
 * Get display text for ingredient
 * @param {Object} ingredient - Ingredient object
 * @returns {string} Display text
 */
export const getIngredientDisplayText = (ingredient) => {
  if (!ingredient || typeof ingredient !== 'object') {
    console.warn('getIngredientDisplayText: Invalid ingredient object');
    return 'ingredient';
  }
  
  let displayText = ingredient.displayText || ingredient.originalText || 'ingredient';
  
  // Ensure we always return a string
  if (typeof displayText !== 'string') {
    console.error('getIngredientDisplayText: Non-string display text detected:', typeof displayText, displayText);
    return String(displayText || 'ingredient');
  }
  
  return displayText;
};

/**
 * Get ingredient amount for display in steps
 * @param {Object} ingredient - Ingredient object
 * @returns {string} Amount text for steps
 */
export const getIngredientAmount = (ingredient) => {
  if (ingredient.structured?.quantity && ingredient.structured?.unit) {
    const quantity = ingredient.structured.quantity;
    const unit = ingredient.structured.unit;
    const unitName = quantity === 1 ? unit.name : unit.plural;
    return `${quantity} ${unitName}`;
  }
  
  // Fallback to extracting from original text
  return extractAmount(ingredient.originalText || ingredient.displayText || '');
};

/**
 * Check if ingredient is structured/parsed
 * @param {Object} ingredient - Ingredient object
 * @returns {boolean} True if ingredient is structured
 */
export const isIngredientStructured = (ingredient) => {
  return ingredient.structured && ingredient.structured.isStructured;
};

/**
 * Create ingredient display ID for tracking
 * @param {Object} ingredient - Ingredient object
 * @returns {string} Display ID
 */
export const getIngredientDisplayId = (ingredient) => {
  return ingredient.id || ingredient.originalText || 'unknown';
};