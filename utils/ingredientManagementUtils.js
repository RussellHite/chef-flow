/**
 * Ingredient Management Utilities
 * 
 * Pure utility functions for ingredient data processing
 */

/**
 * Transform ingredient data for form editing
 */
export const transformIngredientForEdit = (ingredient) => {
  if (!ingredient) return {};
  
  return {
    name: ingredient.name || '',
    plural: ingredient.plural || '',
    category: ingredient.category || '',
    commonUnits: (ingredient.commonUnits || []).join(', '),
    commonPreparations: (ingredient.commonPreparations || []).join(', '),
    searchTerms: (ingredient.searchTerms || []).join(', ')
  };
};

/**
 * Transform form data back to ingredient format
 */
export const transformFormToIngredient = (formData, originalIngredient) => {
  return {
    ...originalIngredient,
    name: formData.name,
    plural: formData.plural,
    category: formData.category,
    commonUnits: formData.commonUnits.split(',').map(u => u.trim()).filter(u => u),
    commonPreparations: formData.commonPreparations.split(',').map(p => p.trim()).filter(p => p),
    searchTerms: formData.searchTerms.split(',').map(t => t.trim()).filter(t => t)
  };
};

/**
 * Validate ingredient form data
 */
export const validateIngredientForm = (formData) => {
  const errors = {};
  
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  if (!formData.category || formData.category.trim() === '') {
    errors.category = 'Category is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if ingredient matches search criteria
 */
export const matchesSearchCriteria = (ingredient, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') return true;
  
  const query = searchQuery.toLowerCase().trim();
  
  // Check name
  if (ingredient.name && ingredient.name.toLowerCase().includes(query)) {
    return true;
  }
  
  // Check search terms
  if (ingredient.searchTerms && ingredient.searchTerms.some(term => 
    term.toLowerCase().includes(query)
  )) {
    return true;
  }
  
  return false;
};

/**
 * Get ingredient display name with fallback
 */
export const getIngredientDisplayName = (ingredient) => {
  return ingredient?.name || 'Unknown Ingredient';
};

/**
 * Get category display name with fallback
 */
export const getCategoryDisplayName = (category) => {
  return category?.name || 'Unknown Category';
};

/**
 * Sort ingredients by name alphabetically
 */
export const sortIngredientsByName = (ingredients) => {
  return [...ingredients].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );
};

/**
 * Group ingredients by category
 */
export const groupIngredientsByCategory = (ingredients) => {
  return ingredients.reduce((groups, ingredient) => {
    const category = ingredient.category || 'uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {});
};

/**
 * Get ingredient statistics
 */
export const getIngredientStats = (ingredients, categories) => {
  const totalIngredients = ingredients.length;
  const categoryCounts = {};
  
  // Count ingredients per category
  ingredients.forEach(ingredient => {
    const category = ingredient.category || 'uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Calculate averages
  const averageUnitsPerIngredient = ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.commonUnits ? ingredient.commonUnits.length : 0);
  }, 0) / Math.max(totalIngredients, 1);
  
  const averagePreparationsPerIngredient = ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.commonPreparations ? ingredient.commonPreparations.length : 0);
  }, 0) / Math.max(totalIngredients, 1);
  
  return {
    total: totalIngredients,
    byCategory: categoryCounts,
    averageUnits: Math.round(averageUnitsPerIngredient * 10) / 10,
    averagePreparations: Math.round(averagePreparationsPerIngredient * 10) / 10,
    categoriesCount: Object.keys(categoryCounts).length
  };
};