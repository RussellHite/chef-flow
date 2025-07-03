/**
 * IngredientService - Abstraction layer for ingredient data management
 * 
 * This service provides a consistent interface for ingredient operations
 * regardless of the underlying data source (embedded database, server API, etc.)
 * 
 * Architecture supports:
 * - Future migration to server-side database
 * - Multiple language support
 * - Offline-first functionality
 */

class IngredientService {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Search for ingredients by name
   * @param {string} query - Search term
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of matching ingredients
   */
  async searchIngredients(query, limit = 20) {
    return this.dataSource.searchIngredients(query, limit);
  }

  /**
   * Get ingredient by ID
   * @param {string} id - Ingredient ID
   * @returns {Promise<Object|null>} Ingredient object or null if not found
   */
  async getIngredientById(id) {
    return this.dataSource.getIngredientById(id);
  }

  /**
   * Get all available units for a specific ingredient
   * @param {string} ingredientId - Ingredient ID
   * @returns {Promise<Array>} Array of applicable units
   */
  async getUnitsForIngredient(ingredientId) {
    return this.dataSource.getUnitsForIngredient(ingredientId);
  }

  /**
   * Get all preparation methods for a specific ingredient
   * @param {string} ingredientId - Ingredient ID
   * @returns {Promise<Array>} Array of applicable preparation methods
   */
  async getPreparationMethodsForIngredient(ingredientId) {
    return this.dataSource.getPreparationMethodsForIngredient(ingredientId);
  }

  /**
   * Parse a free-form ingredient string into structured components
   * @param {string} ingredientText - Raw ingredient text (e.g., "2 cups onions, chopped")
   * @returns {Promise<Object>} Structured ingredient object
   */
  async parseIngredientText(ingredientText) {
    return this.dataSource.parseIngredientText(ingredientText);
  }

  /**
   * Format a structured ingredient into display text
   * @param {Object} ingredient - Structured ingredient object
   * @returns {string} Formatted ingredient text
   */
  formatIngredientForDisplay(ingredient) {
    return this.dataSource.formatIngredientForDisplay(ingredient);
  }

  /**
   * Suggest unit conversions for a given quantity and unit
   * @param {number} quantity - Amount
   * @param {string} unitId - Current unit ID
   * @returns {Promise<Array>} Array of conversion suggestions
   */
  async suggestUnitConversions(quantity, unitId) {
    return this.dataSource.suggestUnitConversions(quantity, unitId);
  }

  /**
   * Get categories for ingredient organization
   * @returns {Promise<Array>} Array of ingredient categories
   */
  async getCategories() {
    return this.dataSource.getCategories();
  }

  /**
   * Get ingredients by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of ingredients in category
   */
  async getIngredientsByCategory(categoryId) {
    return this.dataSource.getIngredientsByCategory(categoryId);
  }

  /**
   * Get all available ingredients
   * @returns {Promise<Array>} Array of all ingredients
   */
  async getAllIngredients() {
    return this.dataSource.getAllIngredients();
  }

  /**
   * Get ingredients that are commonly used in a specific cuisine
   * @param {string} cuisine - Cuisine type
   * @returns {Promise<Array>} Array of ingredients
   */
  async getIngredientsByCuisine(cuisine) {
    return this.dataSource.getIngredientsByCuisine?.(cuisine) || [];
  }

  /**
   * Fallback similarity search using string matching
   * @param {string} ingredientName - Name to search for
   * @param {number} threshold - Minimum similarity threshold (not used in fallback)
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of similar ingredients
   */
  async fallbackSimilaritySearch(ingredientName, threshold, limit) {
    try {
      // Use basic text search as fallback
      const searchResults = await this.searchIngredients(ingredientName, limit * 2);
      
      return searchResults
        .filter(ingredient => 
          ingredient.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
          ingredient.searchTerms?.some(term => 
            term.toLowerCase().includes(ingredientName.toLowerCase())
          )
        )
        .slice(0, limit)
        .map(ingredient => ({
          ...ingredient,
          similarityScore: 0.5, // Default fallback score
          matchType: 'fallback'
        }));
    } catch (error) {
      console.error('Error in fallback similarity search:', error);
      return [];
    }
  }

  /**
   * Find similar ingredients (fallback implementation)
   * @param {string} ingredientName - Name to search for
   * @param {number} threshold - Minimum similarity threshold
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of similar ingredients
   */
  async findSimilarIngredients(ingredientName, threshold = 0.5, limit = 10) {
    return this.fallbackSimilaritySearch(ingredientName, threshold, limit);
  }
}

export default IngredientService;