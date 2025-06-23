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
import TrainingDataService from './TrainingDataService.js';

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
    
    const searchTerm = (query || '').toLowerCase().trim();
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
        (term || '').toLowerCase().includes(searchTerm)) && results.size < limit) {
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
   * Handles various patterns like:
   * - "2 cups flour, chopped"
   * - "large onion, diced"  
   * - "chicken breast, 1 lb, cubed"
   * - "2 (5 oz) cans tomatoes"
   */
  async parseIngredientText(ingredientText) {
    const text = ingredientText.trim();
    
    // Check if we have training data for similar ingredients
    const trainedResult = TrainingDataService.applyTrainingToIngredient(text);
    if (trainedResult) {
      // console.log('Applied training data for:', text);
      return trainedResult;
    }
    
    // Initialize result structure
    const result = {
      quantity: null,
      unit: null,
      ingredient: null,
      preparation: null,
      originalText: text,
      isStructured: false
    };
    
    // Split by commas to separate components
    const parts = text.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length === 0) return result;
    
    // Patterns to identify different components
    const quantityPattern = /^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)/;
    const unitPattern = new RegExp(`\\b(${Object.keys(UNITS).join('|')}(?:s)?)\\b`, 'i');
    const sizeDescriptors = /\b(large|medium|small|extra large|xl|lg|sm)\b/i;
    const parentheticalSizePattern = /\(([^)]*(?:ounce|oz|gram|g|pound|lb|ml|liter|l)[^)]*)\)/gi;
    const dividedPattern = /,?\s*divided\s*$/i;
    
    let remainingParts = [...parts];
    let foundIngredientPart = null;
    let isDivided = false;
    let sizeInfo = null;
    
    // Check for "divided" indicator
    if (dividedPattern.test(text)) {
      isDivided = true;
      // Remove "divided" from the text for further processing
      const lastPart = remainingParts[remainingParts.length - 1];
      if (dividedPattern.test(lastPart)) {
        remainingParts[remainingParts.length - 1] = lastPart.replace(dividedPattern, '').trim();
        if (!remainingParts[remainingParts.length - 1]) {
          remainingParts.pop();
        }
      }
    }
    
    // Extract parenthetical size information
    const fullText = remainingParts.join(' ');
    let sizeMatches = [];
    let match;
    while ((match = parentheticalSizePattern.exec(fullText)) !== null) {
      sizeMatches.push(match[1]);
    }
    if (sizeMatches.length > 0) {
      sizeInfo = sizeMatches.join(', ');
      // Remove parenthetical info from parts for cleaner processing
      remainingParts = remainingParts.map(part => 
        part.replace(parentheticalSizePattern, '').trim()
      ).filter(part => part.length > 0);
    }
    
    // Step 1: Extract quantity and unit from any part
    for (let i = 0; i < remainingParts.length; i++) {
      const part = remainingParts[i];
      
      // Check for quantity + unit pattern (e.g., "2 cups", "1 lb")
      const quantityUnitMatch = part.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s+(.+)/);
      if (quantityUnitMatch) {
        const [, quantityText, remainder] = quantityUnitMatch;
        const unitMatch = remainder.match(unitPattern);
        
        if (unitMatch) {
          result.quantity = this._parseQuantity(quantityText);
          result.unit = this._findUnitByName(unitMatch[1]);
          
          // Remove unit from remainder to get ingredient
          const ingredientText = remainder.replace(unitPattern, '').trim();
          if (ingredientText) {
            foundIngredientPart = ingredientText;
          }
          remainingParts.splice(i, 1);
          break;
        }
      }
      
      // Check for standalone quantity (e.g., "2" in "chicken breast, 2 lbs")
      const quantityMatch = part.match(quantityPattern);
      if (quantityMatch && !result.quantity) {
        result.quantity = this._parseQuantity(quantityMatch[1]);
        remainingParts[i] = part.replace(quantityPattern, '').trim();
        if (!remainingParts[i]) {
          remainingParts.splice(i, 1);
        }
        break;
      }
      
      // Check for standalone unit (e.g., "lbs" in "chicken, 2 lbs")
      const unitMatch = part.match(unitPattern);
      if (unitMatch && !result.unit) {
        result.unit = this._findUnitByName(unitMatch[1]);
        remainingParts[i] = part.replace(unitPattern, '').trim();
        if (!remainingParts[i]) {
          remainingParts.splice(i, 1);
        }
        break;
      }
    }
    
    // Step 2: Identify ingredient from remaining parts
    if (!foundIngredientPart && remainingParts.length > 0) {
      // Look for the part that best matches known ingredients
      let bestMatch = null;
      let bestPartIndex = 0;
      let bestScore = 0;
      
      for (let i = 0; i < remainingParts.length; i++) {
        const part = remainingParts[i];
        
        // Skip if this part looks like a preparation method
        if (this._looksLikePreparation(part)) continue;
        
        // Search for ingredient matches
        const ingredients = await this.searchIngredients(part, 5);
        if (ingredients.length > 0) {
          // Score based on how well the ingredient name matches
          const score = this._calculateIngredientMatchScore(part, ingredients[0]);
          if (score > bestScore) {
            bestMatch = ingredients[0];
            bestScore = score;
            bestPartIndex = i;
            foundIngredientPart = part;
          }
        }
      }
      
      if (bestMatch) {
        result.ingredient = bestMatch;
        remainingParts.splice(bestPartIndex, 1);
      } else if (remainingParts.length > 0) {
        // Use the longest remaining part as ingredient name
        const longestPart = remainingParts.reduce((longest, current) => 
          current.length > longest.length ? current : longest
        );
        const longestIndex = remainingParts.indexOf(longestPart);
        
        result.ingredient = { 
          id: 'custom', 
          name: longestPart, 
          category: 'custom' 
        };
        foundIngredientPart = longestPart;
        remainingParts.splice(longestIndex, 1);
      }
    } else if (foundIngredientPart) {
      // Find ingredient from the found part
      const ingredients = await this.searchIngredients(foundIngredientPart, 5);
      result.ingredient = ingredients[0] || { 
        id: 'custom', 
        name: foundIngredientPart, 
        category: 'custom' 
      };
    }
    
    // Step 3: Treat remaining parts as preparation/description
    let preparationParts = [];
    if (remainingParts.length > 0) {
      preparationParts.push(...remainingParts);
    }
    if (sizeInfo) {
      preparationParts.unshift(`(${sizeInfo})`);
    }
    
    if (preparationParts.length > 0) {
      const preparationText = preparationParts.join(', ');
      
      if (result.ingredient) {
        const prepMethods = await this.getPreparationMethodsForIngredient(result.ingredient.id);
        result.preparation = prepMethods.find(prep => 
          preparationText.toLowerCase().includes(prep.name.toLowerCase())
        ) || { id: 'custom', name: preparationText, requiresStep: this._requiresStep(preparationText) };
      } else {
        result.preparation = { id: 'custom', name: preparationText, requiresStep: this._requiresStep(preparationText) };
      }
    }
    
    // Add metadata
    result.isDivided = isDivided;
    result.sizeInfo = sizeInfo;
    
    // Set as structured if we found at least an ingredient
    result.isStructured = !!result.ingredient;
    
    // If no structure found, treat entire text as ingredient
    if (!result.isStructured) {
      const ingredients = await this.searchIngredients(text, 5);
      result.ingredient = ingredients[0] || { id: 'custom', name: text, category: 'custom' };
      result.isStructured = false;
    }
    
    return result;
  }
  
  /**
   * Check if a text part looks like a preparation method
   */
  _looksLikePreparation(text) {
    const preparationWords = [
      'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded',
      'peeled', 'crushed', 'julienned', 'cubed', 'halved', 'quartered',
      'trimmed', 'cored', 'pitted', 'seeded', 'sifted', 'drained',
      'rinsed', 'dried', 'juiced', 'fresh', 'frozen', 'canned',
      'cooked', 'raw', 'roasted', 'grilled', 'steamed'
    ];
    
    const lowerText = text.toLowerCase();
    return preparationWords.some(word => lowerText.includes(word));
  }
  
  /**
   * Calculate how well an ingredient text matches a known ingredient
   */
  _calculateIngredientMatchScore(text, ingredient) {
    const lowerText = text.toLowerCase();
    const ingredientName = ingredient.name.toLowerCase();
    
    if (lowerText === ingredientName) return 100;
    if (lowerText.includes(ingredientName) || ingredientName.includes(lowerText)) return 80;
    
    // Check search terms
    for (const term of ingredient.searchTerms) {
      const lowerTerm = term.toLowerCase();
      if (lowerText === lowerTerm) return 90;
      if (lowerText.includes(lowerTerm) || lowerTerm.includes(lowerText)) return 60;
    }
    
    return 0;
  }
  
  /**
   * Determine if a preparation text requires a prep step
   */
  _requiresStep(preparationText) {
    const actionWords = [
      'chop', 'dice', 'slice', 'mince', 'grate', 'shred',
      'peel', 'crush', 'julienne', 'cube', 'halve', 'quarter',
      'trim', 'core', 'pit', 'seed', 'sift', 'drain', 'rinse', 'juice'
    ];
    
    const lowerText = preparationText.toLowerCase();
    return actionWords.some(action => 
      lowerText.includes(action + 'ed') || lowerText.includes(action)
    );
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
    if (!unitText) return null;
    const normalizedText = unitText.toLowerCase();
    
    for (const unit of Object.values(UNITS)) {
      if ((unit.name || '').toLowerCase() === normalizedText || 
          (unit.plural || '').toLowerCase() === normalizedText) {
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