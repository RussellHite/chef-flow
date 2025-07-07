/**
 * Embedded Ingredient Data Source
 * 
 * Orchestrates ingredient operations by coordinating specialized services
 * Maintains backward compatibility while improving internal organization
 */

import { IngredientSearchService } from './IngredientSearchService.js';
import { IngredientParsingService } from './IngredientParsingService.js';
import { IngredientDataService } from './IngredientDataService.js';

class EmbeddedIngredientDataSource {
  constructor() {
    // Initialize specialized services
    this.searchService = new IngredientSearchService();
    this.dataService = new IngredientDataService();
    this.parsingService = new IngredientParsingService(this.searchService, this.dataService);
  }


  /**
   * Search for ingredients by name
   */
  async searchIngredients(query, limit = 20) {
    return this.searchService.searchIngredients(query, limit);
  }

  /**
   * Get ingredient by ID
   */
  async getIngredientById(id) {
    return this.dataService.getIngredientById(id);
  }

  /**
   * Get all available units for a specific ingredient
   */
  async getUnitsForIngredient(ingredientId) {
    return this.dataService.getUnitsForIngredient(ingredientId);
  }

  /**
   * Get all preparation methods for a specific ingredient
   */
  async getPreparationMethodsForIngredient(ingredientId) {
    return this.dataService.getPreparationMethodsForIngredient(ingredientId);
  }

  /**
   * Parse a free-form ingredient string into structured components
   */
  async parseIngredientText(ingredientText) {
    return this.parsingService.parseIngredientText(ingredientText);
  }

  /**
   * Batch parse multiple ingredients with cross-referencing for better accuracy
   */
  async batchParseIngredients(ingredientTexts) {
    return this.parsingService.batchParseIngredients(ingredientTexts);
  }

  /**
   * Format a structured ingredient into display text
   */
  formatIngredientForDisplay(ingredient) {
    return this.dataService.formatIngredientForDisplay(ingredient);
  }


  /**
   * Suggest unit conversions for a given quantity and unit
   */
  async suggestUnitConversions(quantity, unitId) {
    return this.dataService.suggestUnitConversions(quantity, unitId);
  }


  /**
   * Get categories for ingredient organization
   */
  async getCategories() {
    return this.dataService.getCategories();
  }

  /**
   * Get ingredients by category
   */
  async getIngredientsByCategory(categoryId) {
    return this.dataService.getIngredientsByCategory(categoryId);
  }

  /**
   * Add a custom ingredient (for user-specific additions)
   */
  async addCustomIngredient(ingredientData) {
    const ingredient = await this.dataService.addCustomIngredient(ingredientData);
    // Also add to search index
    this.searchService.addCustomIngredientToIndex(ingredient);
    return ingredient;
  }

}

export default EmbeddedIngredientDataSource;