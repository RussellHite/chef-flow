/**
 * Ingredient Parsing Service
 * 
 * Handles complex parsing of ingredient text into structured components
 */

import { UNITS } from '../data/ingredientDatabase.js';
import IngredientSimilarityService from './IngredientSimilarityService.js';

export class IngredientParsingService {
  constructor(searchService, dataAccessService) {
    this.searchService = searchService;
    this.dataAccessService = dataAccessService;
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
    // First, preprocess the text to fix common formatting issues
    let text = this._preprocessIngredientText(ingredientText.trim());
    
    // Initialize result structure
    const result = {
      quantity: null,
      unit: null,
      ingredient: null,
      preparation: null,
      originalText: text,
      isStructured: false,
      confidence: {
        quantity: 0,
        unit: 0,
        ingredient: 0,
        preparation: 0,
        overall: 0
      }
    };
    
    // Split by commas to separate components
    const parts = text.split(',').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length === 0) return result;
    
    // Patterns to identify different components
    const quantityPattern = /^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)/;
    
    // Build comprehensive unit pattern from all unit names, plurals, and common aliases
    const allUnitTerms = [];
    Object.values(UNITS).forEach(unit => {
      allUnitTerms.push(unit.name, unit.plural);
      // Add common aliases
      if (unit.id === 'tbsp') allUnitTerms.push('tablespoon', 'tablespoons');
      if (unit.id === 'tsp') allUnitTerms.push('teaspoon', 'teaspoons');
      if (unit.id === 'oz') allUnitTerms.push('ounce', 'ounces');
      if (unit.id === 'lb') allUnitTerms.push('pound', 'pounds');
    });
    // Sort by length descending to match longer terms first (tablespoons before tbsp)
    const sortedUnitTerms = allUnitTerms.filter(Boolean).sort((a, b) => b.length - a.length);
    const unitPattern = new RegExp(`\\b(${sortedUnitTerms.join('|')})\\b`, 'i');
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
          
          // Calculate confidence for quantity and unit
          result.confidence.quantity = this._calculateQuantityConfidence(quantityText);
          result.confidence.unit = this._calculateUnitConfidence(result.unit, unitMatch[1]);
          
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
        result.confidence.quantity = this._calculateQuantityConfidence(quantityMatch[1]);
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
        result.confidence.unit = this._calculateUnitConfidence(result.unit, unitMatch[1]);
        remainingParts[i] = part.replace(unitPattern, '').trim();
        if (!remainingParts[i]) {
          remainingParts.splice(i, 1);
        }
        break;
      }
      
      // Check for "ingredient unit" pattern (e.g., "garlic cloves", "baby spinach")
      // Also handle cases with no space between quantity and ingredient like "2garlic cloves"
      const ingredientUnitMatch = part.match(/^(.+)\s+(cloves?|sprigs?|pieces?|leaves?)$/i);
      if (ingredientUnitMatch && !result.unit) {
        const [, ingredientPart, unitPart] = ingredientUnitMatch;
        result.unit = this._findUnitByName(unitPart);
        result.confidence.unit = this._calculateUnitConfidence(result.unit, unitPart);
        
        // Clean up ingredient part - remove any leading digits that might be stuck
        let cleanIngredientPart = ingredientPart.trim();
        // Remove leading digits if they exist (e.g., "2garlic" -> "garlic")
        cleanIngredientPart = cleanIngredientPart.replace(/^\d+/, '');
        
        // Set the ingredient part for later processing
        if (cleanIngredientPart.trim()) {
          foundIngredientPart = cleanIngredientPart.trim();
        }
        remainingParts.splice(i, 1);
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
        if (this.searchService.looksLikePreparation(part)) continue;
        
        // Search for ingredient matches
        const ingredients = await this.searchService.searchIngredients(part, 10);
        if (ingredients.length > 0) {
          // Use similarity service for better matching
          const similarityResults = IngredientSimilarityService.findBestMatches(
            part, 
            ingredients, 
            1
          );
          
          if (similarityResults.length > 0 && similarityResults[0].score > bestScore) {
            bestMatch = similarityResults[0].ingredient;
            bestScore = similarityResults[0].score;
            bestPartIndex = i;
            foundIngredientPart = part;
          }
        }
      }
      
      if (bestMatch) {
        result.ingredient = bestMatch;
        result.confidence.ingredient = this._calculateIngredientConfidence(bestMatch, bestScore, 'database');
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
        result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, 30, 'custom');
        foundIngredientPart = longestPart;
        remainingParts.splice(longestIndex, 1);
      }
    } else if (foundIngredientPart) {
      // Find ingredient from the found part using enhanced similarity matching
      const ingredients = await this.searchService.searchIngredients(foundIngredientPart, 10);
      
      if (ingredients.length > 0) {
        // Use similarity service to find the best match
        const similarityResults = IngredientSimilarityService.findBestMatches(
          foundIngredientPart, 
          ingredients, 
          1
        );
        
        if (similarityResults.length > 0 && similarityResults[0].score > 40) {
          result.ingredient = similarityResults[0].ingredient;
          result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, similarityResults[0].score, 'fuzzy');
        } else {
          // Create custom ingredient if similarity is too low
          result.ingredient = { 
            id: 'custom', 
            name: foundIngredientPart, 
            category: 'custom' 
          };
          result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, 30, 'custom');
        }
      } else {
        result.ingredient = { 
          id: 'custom', 
          name: foundIngredientPart, 
          category: 'custom' 
        };
        result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, 30, 'custom');
      }
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
        const prepMethods = await this.dataAccessService.getPreparationMethodsForIngredient(result.ingredient.id);
        const foundPrepMethod = prepMethods.find(prep => 
          preparationText.toLowerCase().includes(prep.name.toLowerCase())
        );
        result.preparation = foundPrepMethod || { id: 'custom', name: preparationText, requiresStep: this._requiresStep(preparationText) };
        result.confidence.preparation = this._calculatePreparationConfidence(result.preparation, foundPrepMethod ? 'database' : 'custom');
      } else {
        result.preparation = { id: 'custom', name: preparationText, requiresStep: this._requiresStep(preparationText) };
        result.confidence.preparation = this._calculatePreparationConfidence(result.preparation, 'custom');
      }
    }
    
    // Add metadata
    result.isDivided = isDivided;
    result.sizeInfo = sizeInfo;
    
    // Set as structured if we found at least an ingredient
    result.isStructured = !!result.ingredient;
    
    // If no structure found, treat entire text as ingredient with smart matching
    if (!result.isStructured) {
      const ingredients = await this.searchService.searchIngredients(text, 10);
      
      if (ingredients.length > 0) {
        // Use similarity service for final fallback matching
        const similarityResults = IngredientSimilarityService.findBestMatches(
          text, 
          ingredients, 
          1
        );
        
        if (similarityResults.length > 0 && similarityResults[0].score > 25) {
          result.ingredient = similarityResults[0].ingredient;
          result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, similarityResults[0].score, 'fuzzy');
          result.isStructured = true; // We found a reasonable match
        } else {
          result.ingredient = { id: 'custom', name: text, category: 'custom' };
          result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, 30, 'custom');
        }
      } else {
        result.ingredient = { id: 'custom', name: text, category: 'custom' };
        result.confidence.ingredient = this._calculateIngredientConfidence(result.ingredient, 30, 'custom');
      }
      
      if (!result.isStructured) {
        result.isStructured = false;
      }
    }
    
    // Calculate overall confidence
    result.confidence.overall = this._calculateOverallConfidence(result);
    
    return result;
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
   * Preprocess ingredient text to fix common formatting issues
   */
  _preprocessIngredientText(text) {
    if (!text) return text;
    
    // Add debug logging to see what we're working with
    console.log('🔍 Raw ingredient input:', JSON.stringify(text));
    
    let processed = text;
    
    // Phase 1: Handle mixed fractions FIRST (e.g., "21/2cups" -> "2 1/2 cups")
    // This must come before other number processing
    processed = processed.replace(/(\d+)(1\/\d+)/g, '$1 $2');
    
    // Phase 2: Handle quantities and parenthetical info
    // Fix missing spaces after parenthetical quantities (e.g., "2(5oz)" -> "2 (5oz)")
    processed = processed.replace(/(\d+)\s*\(/g, '$1 (');
    
    // Fix missing spaces before parenthetical info (e.g., "flour(sifted)" -> "flour (sifted)")
    processed = processed.replace(/([a-zA-Z])\s*\(/g, '$1 (');
    
    // Phase 3: Create comprehensive pattern matching for quantity+unit+ingredient
    // Create comprehensive unit list - MUST be ordered from longest to shortest
    const units = [
      // Long forms first to avoid partial matches
      'tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 'ounces', 'ounce', 'pounds', 'pound',
      'containers', 'container', 'packages', 'package', 'gallons', 'gallon', 'quarts', 'quart',
      'liters', 'liter', 'bottles', 'bottle', 'pieces', 'piece', 'cloves', 'clove', 'sprigs', 'sprig',
      'pinches', 'pinch', 'dashes', 'dash', 'slices', 'slice', 'grams', 'gram',
      // Short forms - plural MUST come before singular
      'cups', 'cup', 'tbsp', 'tsp', 'lbs', 'lb', 'oz', 'kg', 'ml', 'cans', 'can', 'pints', 'pint',
      'boxes', 'box', 'jars', 'jar', 'whole', 'small', 'medium', 'large'
    ];
    
    // Phase 4: Apply quantity+unit separation with improved logic
    // Process each unit, looking for direct attachment to quantities
    units.forEach(unit => {
      // Create pattern that only matches when there's NO space between quantity and unit
      const pattern = new RegExp(`(\\d+(?:\\.\\d+)?(?:\\s+\\d+/\\d+)?(?:/\\d+)?)${unit}\\b`, 'gi');
      processed = processed.replace(pattern, `$1 ${unit}`);
    });
    
    // Phase 4.5: Handle quantity stuck to ingredient name (e.g., "2garlic" -> "2 garlic")
    // Look for pattern: number + lowercase letter (indicating missing space)
    processed = processed.replace(/(\d+)([a-z])/g, '$1 $2');
    
    // Phase 5: Handle remaining edge cases
    // Fix missing spaces after commas
    processed = processed.replace(/,([a-zA-Z])/g, ', $1');
    
    // Normalize multiple spaces to single space
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Add debug logging to see the result
    if (processed !== text) {
      console.log('🔧 Preprocessed ingredient:', JSON.stringify(processed));
    }
    
    // Additional debug for cloves specifically
    if (text.includes('cloves') || text.includes('clove')) {
      console.log('🧄 Cloves ingredient - before:', JSON.stringify(text));
      console.log('🧄 Cloves ingredient - after:', JSON.stringify(processed));
    }
    
    return processed;
  }

  /**
   * Batch process multiple ingredients with cross-referencing for better accuracy
   * This method can improve parsing by understanding ingredient context
   * @param {Array<string>} ingredientTexts - Array of ingredient text strings
   * @returns {Promise<Array>} Array of parsed ingredient results
   */
  async batchParseIngredients(ingredientTexts) {
    if (!ingredientTexts || ingredientTexts.length === 0) {
      return [];
    }

    const results = [];
    const allParsedIngredients = [];

    // First pass: Parse all ingredients individually
    for (const text of ingredientTexts) {
      try {
        const parsed = await this.parseIngredientText(text);
        allParsedIngredients.push(parsed);
        results.push(parsed);
      } catch (error) {
        console.warn('Error parsing ingredient in batch:', text, error);
        results.push({
          originalText: text,
          ingredient: { id: 'custom', name: text, category: 'custom' },
          isStructured: false
        });
      }
    }

    // Second pass: Cross-reference and improve accuracy
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // If ingredient wasn't recognized well, try to improve it using context
      if (!result.isStructured || (result.ingredient && result.ingredient.id === 'custom')) {
        const improvedIngredient = await this._improveIngredientWithContext(
          result,
          allParsedIngredients,
          ingredientTexts[i]
        );
        
        if (improvedIngredient) {
          results[i] = improvedIngredient;
        }
      }
    }

    return results;
  }

  /**
   * Improve ingredient recognition using context from other ingredients in the recipe
   * @param {Object} ingredient - The ingredient to improve
   * @param {Array} allIngredients - All other parsed ingredients for context
   * @param {string} originalText - Original text for fallback
   * @returns {Promise<Object|null>} Improved ingredient or null if no improvement
   */
  async _improveIngredientWithContext(ingredient, allIngredients, originalText) {
    if (!ingredient || !originalText) return null;

    // Extract potential ingredient names from the original text
    const words = originalText.toLowerCase().split(/\s+/);
    const potentialNames = [];
    
    // Try different combinations of words as potential ingredient names
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j <= words.length; j++) {
        const phrase = words.slice(i, j).join(' ');
        if (phrase.length > 2 && !this._isQuantityOrUnit(phrase)) {
          potentialNames.push(phrase);
        }
      }
    }

    // Search for each potential name and find the best match
    let bestMatch = null;
    let bestScore = 0;

    for (const name of potentialNames) {
      const ingredients = await this.searchService.searchIngredients(name, 5);
      
      if (ingredients.length > 0) {
        const similarityResults = IngredientSimilarityService.findBestMatches(
          name,
          ingredients,
          1
        );
        
        if (similarityResults.length > 0 && similarityResults[0].score > bestScore) {
          bestMatch = similarityResults[0].ingredient;
          bestScore = similarityResults[0].score;
        }
      }
    }

    // Only use the improved match if it's significantly better
    if (bestMatch && bestScore > 50) {
      return {
        ...ingredient,
        ingredient: bestMatch,
        isStructured: true
      };
    }

    return null;
  }

  /**
   * Check if a text phrase is likely a quantity or unit rather than an ingredient name
   * @param {string} phrase - Text phrase to check
   * @returns {boolean} True if likely quantity/unit
   */
  _isQuantityOrUnit(phrase) {
    // Check if it's a number
    if (/^\d+/.test(phrase)) return true;
    
    // Check if it's a known unit
    const unitNames = Object.values(UNITS).flatMap(unit => [
      unit.name, unit.plural, ...Object.keys(unit.aliases || {})
    ]);
    
    return unitNames.some(unit => 
      unit && phrase.toLowerCase().includes(unit.toLowerCase())
    );
  }

  /**
   * Calculate confidence score for quantity parsing
   * @param {string} quantityText - The parsed quantity text
   * @returns {number} Confidence score 0-100
   */
  _calculateQuantityConfidence(quantityText) {
    if (!quantityText) return 0;
    
    // Simple number: high confidence
    if (/^\d+(\.\d+)?$/.test(quantityText.trim())) return 100;
    
    // Fraction: high confidence
    if (/^\d+\/\d+$/.test(quantityText.trim())) return 95;
    
    // Mixed number (e.g., "2 1/2"): high confidence
    if (/^\d+\s+\d+\/\d+$/.test(quantityText.trim())) return 95;
    
    // Range (e.g., "2-3"): medium-high confidence
    if (/^\d+[-–]\d+$/.test(quantityText.trim())) return 85;
    
    // Complex quantity with parenthetical: medium confidence
    if (/\d+.*\(.*\)/.test(quantityText)) return 70;
    
    // Has numbers but complex: lower confidence
    if (/\d+/.test(quantityText)) return 60;
    
    return 30; // Default low confidence
  }

  /**
   * Calculate confidence score for unit matching
   * @param {Object} unitObject - The matched unit object
   * @param {string} originalText - The original unit text
   * @returns {number} Confidence score 0-100
   */
  _calculateUnitConfidence(unitObject, originalText) {
    if (!unitObject || !originalText) return 0;
    
    const normalizedOriginal = originalText.toLowerCase().trim();
    
    // Exact match with unit name: highest confidence
    if (unitObject.name && unitObject.name.toLowerCase() === normalizedOriginal) return 100;
    
    // Exact match with plural: highest confidence
    if (unitObject.plural && unitObject.plural.toLowerCase() === normalizedOriginal) return 100;
    
    // Common aliases: high confidence
    const aliases = {
      'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
      'teaspoon': 'tsp', 'teaspoons': 'tsp',
      'ounce': 'oz', 'ounces': 'oz',
      'pound': 'lb', 'pounds': 'lb'
    };
    
    if (aliases[normalizedOriginal] === unitObject.id) return 90;
    
    // Partial match: medium confidence
    if (unitObject.name && normalizedOriginal.includes(unitObject.name.toLowerCase())) return 70;
    if (unitObject.plural && normalizedOriginal.includes(unitObject.plural.toLowerCase())) return 70;
    
    return 50; // Default medium-low confidence for unit matches
  }

  /**
   * Calculate confidence score for ingredient matching
   * @param {Object} ingredient - The matched ingredient object
   * @param {number} similarityScore - Similarity score from matching
   * @param {string} matchType - Type of match (database, fuzzy, custom)
   * @returns {number} Confidence score 0-100
   */
  _calculateIngredientConfidence(ingredient, similarityScore, matchType) {
    if (!ingredient) return 0;
    
    switch (matchType) {
      case 'database':
        // Direct database match but check similarity score
        return Math.min(100, Math.max(80, similarityScore));
      
      case 'fuzzy':
        // Fuzzy match - use similarity score directly
        return Math.min(95, Math.max(25, similarityScore));
      
      case 'custom':
        // Custom ingredient - low confidence
        return 30;
      
      default:
        return 50;
    }
  }

  /**
   * Calculate confidence score for preparation matching
   * @param {Object} preparation - The preparation object
   * @param {string} matchType - Type of match (database, custom)
   * @returns {number} Confidence score 0-100
   */
  _calculatePreparationConfidence(preparation, matchType) {
    if (!preparation || !preparation.name) return 0;
    
    switch (matchType) {
      case 'database':
        // Found in database: high confidence
        return 90;
      
      case 'inferred':
        // Inferred from text: medium confidence
        return 60;
      
      case 'custom':
        // Custom text: low confidence
        return 30;
      
      default:
        return 50;
    }
  }

  /**
   * Calculate overall confidence score
   * @param {Object} result - The parsing result object
   * @returns {number} Overall confidence score 0-100
   */
  _calculateOverallConfidence(result) {
    const confidences = result.confidence;
    let total = 0;
    let count = 0;
    let weights = {
      ingredient: 0.4, // Most important
      quantity: 0.25,
      unit: 0.25,
      preparation: 0.1 // Least important
    };
    
    // Only include components that exist
    if (result.ingredient) {
      total += confidences.ingredient * weights.ingredient;
      count += weights.ingredient;
    }
    
    if (result.quantity !== null && result.quantity !== undefined) {
      total += confidences.quantity * weights.quantity;
      count += weights.quantity;
    }
    
    if (result.unit) {
      total += confidences.unit * weights.unit;
      count += weights.unit;
    }
    
    if (result.preparation) {
      total += confidences.preparation * weights.preparation;
      count += weights.preparation;
    }
    
    // If no components, return 0
    if (count === 0) return 0;
    
    // Return weighted average
    return Math.round(total / count);
  }
}