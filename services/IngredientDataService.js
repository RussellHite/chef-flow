/**
 * Ingredient Data Service
 * 
 * Handles data access operations for ingredients, units, and conversions
 */

import { 
  CATEGORIES, 
  UNITS, 
  PREPARATION_METHODS, 
  INGREDIENTS, 
  UNIT_CONVERSIONS 
} from '../data/ingredientDatabase.js';

export class IngredientDataService {
  constructor() {
    this.customIngredients = new Map();
  }

  /**
   * Get ingredient by ID
   */
  async getIngredientById(id) {
    return INGREDIENTS[id] || this.customIngredients.get(id) || null;
  }

  /**
   * Get all available units for a specific ingredient
   */
  async getUnitsForIngredient(ingredientId) {
    const ingredient = await this.getIngredientById(ingredientId);
    if (!ingredient) return [];
    
    return ingredient.commonUnits.map(unitId => UNITS[unitId]).filter(Boolean);
  }

  /**
   * Get all preparation methods for a specific ingredient
   */
  async getPreparationMethodsForIngredient(ingredientId) {
    const ingredient = await this.getIngredientById(ingredientId);
    if (!ingredient) return [];
    
    return ingredient.commonPreparations.map(prepId => 
      PREPARATION_METHODS[prepId] || { id: prepId, name: prepId, requiresStep: false }
    );
  }

  /**
   * Get categories for ingredient organization
   */
  async getCategories() {
    return Object.values(CATEGORIES);
  }

  /**
   * Get ingredients by category
   */
  async getIngredientsByCategory(categoryId) {
    const ingredients = Object.values(INGREDIENTS).filter(
      ingredient => ingredient.category === categoryId
    );
    
    // Include custom ingredients in the same category
    for (const customIngredient of this.customIngredients.values()) {
      if (customIngredient.category === categoryId) {
        ingredients.push(customIngredient);
      }
    }
    
    return ingredients;
  }

  /**
   * Add a custom ingredient (for user-specific additions)
   */
  async addCustomIngredient(ingredientData) {
    const id = `custom_${Date.now()}`;
    const ingredient = {
      id,
      ...ingredientData,
      category: ingredientData.category || 'custom',
      commonUnits: ingredientData.commonUnits || ['piece', 'cup'],
      commonPreparations: ingredientData.commonPreparations || [],
      searchTerms: [ingredientData.name, ...(ingredientData.searchTerms || [])]
    };
    
    this.customIngredients.set(id, ingredient);
    return ingredient;
  }

  /**
   * Format a structured ingredient into display text
   */
  formatIngredientForDisplay(ingredient) {
    const parts = [];
    
    if (ingredient.quantity !== null) {
      parts.push(this._formatQuantity(ingredient.quantity));
    }
    
    if (ingredient.unit) {
      const unitName = ingredient.quantity === 1 ? ingredient.unit.name : ingredient.unit.plural;
      parts.push(unitName);
    }
    
    parts.push(ingredient.ingredient.name);
    
    if (ingredient.preparation) {
      parts.push(`, ${ingredient.preparation.name}`);
    }
    
    return parts.join(' ');
  }

  /**
   * Format quantity for display (convert decimals to fractions when appropriate)
   */
  _formatQuantity(quantity) {
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
  }

  /**
   * Suggest unit conversions for a given quantity and unit
   */
  async suggestUnitConversions(quantity, unitId) {
    const unit = UNITS[unitId];
    if (!unit || !UNIT_CONVERSIONS[unit.type]) {
      return [];
    }
    
    const conversions = UNIT_CONVERSIONS[unit.type][unitId] || {};
    const suggestions = [];
    
    for (const [targetUnitId, conversionFactor] of Object.entries(conversions)) {
      const convertedQuantity = quantity * conversionFactor;
      const targetUnit = UNITS[targetUnitId];
      
      if (targetUnit && this._isReasonableConversion(convertedQuantity)) {
        suggestions.push({
          quantity: convertedQuantity,
          unit: targetUnit,
          displayText: `${this._formatQuantity(convertedQuantity)} ${
            convertedQuantity === 1 ? targetUnit.name : targetUnit.plural
          }`
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Check if a converted quantity makes sense for cooking
   */
  _isReasonableConversion(quantity) {
    return quantity >= 0.125 && quantity <= 100;
  }
}