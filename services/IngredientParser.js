/**
 * Ingredient Parser Service
 * 
 * Handles complex ingredient parsing and text manipulation logic
 */

export class IngredientParser {
  /**
   * Parse ingredient text and create structured ingredient
   * @param {string} ingredientText - Raw ingredient text
   * @returns {Promise<Object>} Structured ingredient object
   */
  static async parseIngredientText(ingredientText) {
    if (!ingredientText || typeof ingredientText !== 'string') {
      return this.createFallbackIngredient(ingredientText);
    }

    try {
      const ingredientService = await import('../services/ingredientServiceInstance.js')
        .then(module => module.default);
      
      return await ingredientService.parseIngredientText(ingredientText.trim());
    } catch (error) {
      console.warn('Error parsing ingredient text:', error);
      return this.createFallbackIngredient(ingredientText);
    }
  }

  /**
   * Re-parse ingredient with custom name preservation
   * @param {string} newText - New ingredient text
   * @param {Object} originalIngredient - Original ingredient object
   * @returns {Promise<Object>} Updated ingredient object
   */
  static async reparseIngredientWithNamePreservation(newText, originalIngredient) {
    if (!newText || !newText.trim()) {
      return originalIngredient;
    }

    try {
      // Re-parse the ingredient text
      const structured = await this.parseIngredientText(newText.trim());
      
      // Extract the ingredient name from the edited text
      // This preserves what the user typed instead of relying on database matches
      const userIngredientName = this.extractUserIngredientName(newText.trim(), structured);
      
      // Override the parsed ingredient name with what the user typed
      if (userIngredientName && structured.ingredient) {
        structured.ingredient = {
          id: 'custom',
          name: userIngredientName,
          category: 'custom'
        };
      }
      
      const ingredientService = await import('../services/ingredientServiceInstance.js')
        .then(module => module.default);

      return {
        ...originalIngredient,
        originalText: newText.trim(),
        structured: structured,
        displayText: structured.isStructured 
          ? ingredientService.formatIngredientForDisplay(structured)
          : newText.trim()
      };
    } catch (error) {
      console.warn('Error re-parsing ingredient:', error);
      // Fallback to simple text update
      return {
        ...originalIngredient,
        originalText: newText.trim(),
        structured: null,
        displayText: newText.trim()
      };
    }
  }

  /**
   * Extract user-intended ingredient name from text
   * @param {string} text - Ingredient text
   * @param {Object} structured - Parsed structured data
   * @returns {string} Extracted ingredient name
   */
  static extractUserIngredientName(text, structured) {
    const textParts = text.trim().split(/\s+/);
    let startIndex = 0;
    
    // Skip quantity (numbers, fractions, decimals)
    if (textParts[0] && /^\d/.test(textParts[0])) {
      startIndex = 1;
    }
    
    // Skip unit if present
    if (textParts[startIndex] && structured.unit && 
        (textParts[startIndex].toLowerCase() === structured.unit.name?.toLowerCase() ||
         textParts[startIndex].toLowerCase() === structured.unit.plural?.toLowerCase())) {
      startIndex++;
    }
    
    // Extract ingredient name (everything after quantity and unit, before comma)
    const remainingText = textParts.slice(startIndex).join(' ');
    const commaIndex = remainingText.indexOf(',');
    
    return commaIndex > -1 
      ? remainingText.substring(0, commaIndex).trim()
      : remainingText.trim();
  }

  /**
   * Format ingredient for display
   * @param {Object} ingredient - Ingredient object
   * @returns {Promise<string>} Formatted display text
   */
  static async formatIngredientForDisplay(ingredient) {
    if (!ingredient) return '';

    try {
      if (ingredient.structured && ingredient.structured.isStructured) {
        const ingredientService = await import('../services/ingredientServiceInstance.js')
          .then(module => module.default);
        
        return ingredientService.formatIngredientForDisplay(ingredient.structured);
      }
      
      return ingredient.displayText || ingredient.originalText || '';
    } catch (error) {
      console.warn('Error formatting ingredient for display:', error);
      return ingredient.displayText || ingredient.originalText || '';
    }
  }

  /**
   * Create fallback ingredient object for parsing failures
   * @param {string} text - Original text
   * @returns {Object} Fallback ingredient object
   */
  static createFallbackIngredient(text) {
    return {
      quantity: null,
      unit: null,
      ingredient: { 
        id: 'custom', 
        name: text || 'ingredient', 
        category: 'custom' 
      },
      preparation: null,
      originalText: text || '',
      isStructured: false
    };
  }

  /**
   * Validate ingredient data
   * @param {Object} ingredient - Ingredient object to validate
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  static validateIngredient(ingredient) {
    const errors = [];
    
    if (!ingredient) {
      errors.push('Ingredient object is required');
      return { isValid: false, errors };
    }
    
    if (!ingredient.originalText && !ingredient.displayText) {
      errors.push('Ingredient text is required');
    }
    
    if (ingredient.structured && ingredient.structured.isStructured) {
      if (!ingredient.structured.ingredient || !ingredient.structured.ingredient.name) {
        errors.push('Structured ingredient must have a name');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create new ingredient from text input
   * @param {string} text - Raw ingredient text
   * @param {string} id - Optional ID for the ingredient
   * @returns {Promise<Object>} New ingredient object
   */
  static async createNewIngredient(text, id = null) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Valid ingredient text is required');
    }

    const { generateId } = await import('../utils/recipeUtils');
    
    const structured = await this.parseIngredientText(text.trim());
    const displayText = await this.formatIngredientForDisplay({ structured });

    return {
      id: id || generateId('ingredient'),
      originalText: text.trim(),
      structured: structured,
      displayText: displayText || text.trim(),
      isNew: true
    };
  }
}