/**
 * Recipe Creation Utility Functions
 * 
 * Helper functions for recipe creation form and processing
 */

/**
 * Create initial form data object
 * @param {string} title - Initial title
 * @param {string} ingredients - Initial ingredients
 * @param {string} steps - Initial steps
 * @returns {Object} Form data object
 */
export const createRecipeFormData = (title = '', ingredients = '', steps = '') => ({
  title,
  ingredients,
  steps
});

/**
 * Validate recipe form data
 * @param {Object} formData - Form data object
 * @returns {boolean} True if form is valid
 */
export const validateRecipeForm = (formData) => {
  const { title, ingredients, steps } = formData;
  return title.trim().length > 0 && 
         ingredients.trim().length > 0 && 
         steps.trim().length > 0;
};

/**
 * Check if form has any changes
 * @param {Object} formData - Form data object
 * @returns {boolean} True if form has changes
 */
export const hasFormChanges = (formData) => {
  const { title, ingredients, steps } = formData;
  return !!(title.trim() || ingredients.trim() || steps.trim());
};

/**
 * Clean and format form data
 * @param {Object} formData - Raw form data
 * @returns {Object} Cleaned form data
 */
export const cleanFormData = (formData) => ({
  title: (formData.title || '').trim(),
  ingredients: (formData.ingredients || '').trim(),
  steps: (formData.steps || '').trim()
});

/**
 * Get field validation status
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @returns {Object} Validation result
 */
export const validateField = (field, value) => {
  const trimmed = (value || '').trim();
  
  switch (field) {
    case 'title':
      return {
        isValid: trimmed.length >= 3 && trimmed.length <= 100,
        message: trimmed.length < 3 
          ? 'Title must be at least 3 characters'
          : trimmed.length > 100 
          ? 'Title must be less than 100 characters'
          : null
      };
      
    case 'ingredients':
      return {
        isValid: trimmed.length >= 10,
        message: trimmed.length < 10 
          ? 'Please provide more detailed ingredients'
          : null
      };
      
    case 'steps':
      return {
        isValid: trimmed.length >= 20,
        message: trimmed.length < 20 
          ? 'Please provide more detailed cooking steps'
          : null
      };
      
    default:
      return { isValid: true, message: null };
  }
};

/**
 * Calculate form completion percentage
 * @param {Object} formData - Form data object
 * @returns {number} Completion percentage (0-100)
 */
export const calculateFormCompletion = (formData) => {
  const { title, ingredients, steps } = formData;
  let completed = 0;
  const total = 3;
  
  if (title && title.trim().length > 0) completed++;
  if (ingredients && ingredients.trim().length > 0) completed++;
  if (steps && steps.trim().length > 0) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Get form suggestions for improvement
 * @param {Object} formData - Form data object
 * @returns {Array} Array of suggestion strings
 */
export const getFormSuggestions = (formData) => {
  const { title, ingredients, steps } = formData;
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
};

/**
 * Format placeholder text for better display
 * @param {string} text - Raw placeholder text
 * @returns {string} Formatted placeholder text
 */
export const formatPlaceholder = (text) => {
  return text.replace(/&#10;/g, '\n');
};