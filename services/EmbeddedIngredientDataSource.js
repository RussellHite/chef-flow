/**
 * Embedded Ingredient Data Source
 * 
 * Local implementation of ingredient data operations
 * Optimized for performance and offline functionality
 */

import { 
  CATEGORIES, 
  UNITS, 
  PREPARATION_METHODS, 
  INGREDIENTS, 
  UNIT_CONVERSIONS 
} from '../data/ingredientDatabase.js';

class EmbeddedIngredientDataSource {
  constructor() {
    // Pre-computed search indexes for performance
    this.searchIndex = this._buildSearchIndex();
    this.customIngredients = new Map(); // For user-added ingredients
  }

  /**
   * Build search index for fast ingredient lookup
   */
  _buildSearchIndex() {
    const index = new Map();
    
    Object.values(INGREDIENTS).forEach(ingredient => {
      // Index all search terms
      ingredient.searchTerms.forEach(term => {
        const key = term.toLowerCase();
        if (!index.has(key)) {
          index.set(key, []);
        }
        index.get(key).push(ingredient);
      });
      
      // Index partial matches
      ingredient.searchTerms.forEach(term => {
        for (let i = 1; i <= term.length; i++) {
          const partial = term.toLowerCase().substring(0, i);
          if (!index.has(partial)) {
            index.set(partial, []);
          }
          if (!index.get(partial).includes(ingredient)) {
            index.get(partial).push(ingredient);
          }
        }
      });
    });
    
    return index;
  }

  /**
   * Search for ingredients by name
   */
  async searchIngredients(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return Object.values(INGREDIENTS).slice(0, limit);
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = new Set();
    
    // Exact matches first
    if (this.searchIndex.has(searchTerm)) {
      this.searchIndex.get(searchTerm).forEach(ingredient => results.add(ingredient));
    }
    
    // Partial matches
    for (const [key, ingredients] of this.searchIndex.entries()) {
      if (key.includes(searchTerm) && results.size < limit) {
        ingredients.forEach(ingredient => results.add(ingredient));
      }
    }
    
    // Include custom ingredients
    for (const customIngredient of this.customIngredients.values()) {
      if (customIngredient.searchTerms.some(term => 
        term.toLowerCase().includes(searchTerm)) && results.size < limit) {
        results.add(customIngredient);
      }
    }
    
    return Array.from(results).slice(0, limit);
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
   * Parse a free-form ingredient string into structured components
   */
  async parseIngredientText(ingredientText) {
    const text = ingredientText.trim();
    
    // Enhanced regex to handle complex amounts like "2 (5 ounce)"
    const regex = /^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s+(.*)/;
    const match = text.match(regex);
    
    if (!match) {
      // No quantity found - treat as ingredient name only
      const ingredients = await this.searchIngredients(text, 5);
      const bestMatch = ingredients[0];
      
      return {
        quantity: null,
        unit: null,
        ingredient: bestMatch || { id: 'custom', name: text, category: 'custom' },
        preparation: null,
        originalText: text,
        isStructured: false
      };
    }
    
    const [, quantityPart, remainder] = match;
    
    // Parse unit and ingredient from remainder
    const unitPattern = Object.keys(UNITS).join('|');
    const unitRegex = new RegExp(`^(${unitPattern}s?)\\s+(.*)`, 'i');
    const unitMatch = remainder.match(unitRegex);
    
    let unit = null;
    let ingredientPart = remainder;
    
    if (unitMatch) {
      const [, unitText, ingredientText] = unitMatch;
      unit = this._findUnitByName(unitText);
      ingredientPart = ingredientText;
    }
    
    // Parse preparation from ingredient part
    const parts = ingredientPart.split(',').map(p => p.trim());
    const mainIngredientText = parts[0];
    const preparationText = parts.slice(1).join(', ');
    
    // Find best matching ingredient
    const ingredients = await this.searchIngredients(mainIngredientText, 5);
    const bestMatch = ingredients[0] || { 
      id: 'custom', 
      name: mainIngredientText, 
      category: 'custom' 
    };
    
    // Find preparation method
    let preparation = null;
    if (preparationText) {
      const prepMethods = await this.getPreparationMethodsForIngredient(bestMatch.id);
      preparation = prepMethods.find(prep => 
        preparationText.toLowerCase().includes(prep.name.toLowerCase())
      ) || { id: 'custom', name: preparationText, requiresStep: true };
    }
    
    return {
      quantity: this._parseQuantity(quantityPart),
      unit: unit,
      ingredient: bestMatch,
      preparation: preparation,
      originalText: text,
      isStructured: true
    };
  }

  /**
   * Parse quantity string (handles fractions, ranges, parenthetical info)
   */
  _parseQuantity(quantityText) {
    // Handle fractions
    if (quantityText.includes('/')) {
      const [whole, fraction] = quantityText.split(' ');
      if (fraction && fraction.includes('/')) {
        const [num, den] = fraction.split('/');
        return parseFloat(whole || 0) + parseFloat(num) / parseFloat(den);
      } else {
        const [num, den] = quantityText.split('/');
        return parseFloat(num) / parseFloat(den);
      }
    }
    
    // Handle ranges (take first number)
    if (quantityText.includes('-') || quantityText.includes('to')) {
      const rangeMatch = quantityText.match(/(\d+(?:\.\d+)?)/);
      return rangeMatch ? parseFloat(rangeMatch[1]) : 1;
    }
    
    // Handle parenthetical (extract main number)
    const numberMatch = quantityText.match(/(\d+(?:\.\d+)?)/);
    return numberMatch ? parseFloat(numberMatch[1]) : 1;
  }

  /**
   * Find unit by name (handles plurals and aliases)
   */
  _findUnitByName(unitText) {
    const normalizedText = unitText.toLowerCase();
    
    for (const unit of Object.values(UNITS)) {
      if (unit.name.toLowerCase() === normalizedText || 
          unit.plural.toLowerCase() === normalizedText) {
        return unit;
      }
    }
    
    // Handle common aliases
    const aliases = {
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'ounce': 'oz',
      'ounces': 'oz',
      'pound': 'lb',
      'pounds': 'lb'
    };
    
    if (aliases[normalizedText]) {
      return UNITS[aliases[normalizedText]];
    }
    
    return null;
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
    
    // Update search index
    ingredient.searchTerms.forEach(term => {
      const key = term.toLowerCase();
      if (!this.searchIndex.has(key)) {
        this.searchIndex.set(key, []);
      }
      this.searchIndex.get(key).push(ingredient);
    });
    
    return ingredient;
  }
}

export default EmbeddedIngredientDataSource;