/**
 * Recipe Content Synchronization Service
 * 
 * Handles complex logic for keeping recipe steps synchronized with ingredient changes
 */

import { getIngredientName, getIngredientDisplayText } from '../utils/ingredientUtils';

export class RecipeContentSyncService {
  /**
   * Update all step content to reflect current ingredient data
   * @param {Array} steps - Array of step objects
   * @param {Array} ingredients - Array of ingredient objects
   * @param {Map} originalStepContent - Map of original step content
   * @returns {Array} Updated steps with synchronized content
   */
  static updateAllStepsContent(steps, ingredients, originalStepContent) {
    if (!steps || !ingredients || ingredients.length === 0) {
      return steps || [];
    }

    console.log('🔄 Starting comprehensive step content update');
    console.log('Steps:', steps.length, 'Ingredients:', ingredients.length);

    const usedInSteps = new Set();
    const stepIngredientMapping = new Map();

    // First pass: build ingredient mapping and track usage
    steps.forEach(step => {
      if (step.ingredients && step.ingredients.length > 0) {
        step.ingredients.forEach(stepIngredient => {
          const matchedIngredient = this.findMatchingIngredient(stepIngredient, ingredients);
          if (matchedIngredient) {
            stepIngredientMapping.set(stepIngredient.id || stepIngredient.text, matchedIngredient);
          }
        });
      }
    });

    // Second pass: update step content
    const updatedSteps = steps.map((step, stepIndex) => {
      let updatedContent = originalStepContent?.get(step.id) || step.content;
      const updatedStepIngredients = [];
      
      if (step.ingredients && step.ingredients.length > 0) {
        step.ingredients.forEach(stepIngredient => {
          const matchedIngredient = stepIngredientMapping.get(stepIngredient.id || stepIngredient.text);
          
          if (matchedIngredient) {
            const ingredientName = getIngredientName(matchedIngredient);
            const displayText = getIngredientDisplayText(matchedIngredient);
            
            // Check if this is the first mention
            const isFirstMention = !usedInSteps.has(ingredientName);
            if (isFirstMention) {
              usedInSteps.add(ingredientName);
            }

            // Update content based on ingredient structure
            updatedContent = this.updateStepContentForIngredient(
              updatedContent,
              matchedIngredient,
              stepIngredient,
              isFirstMention
            );

            // Update step ingredient entry
            updatedStepIngredients.push({
              id: matchedIngredient.id,
              text: isFirstMention ? displayText : ingredientName,
              fullText: displayText,
              isFirstMention: isFirstMention,
              firstMentionStepId: isFirstMention ? step.id : null
            });
          } else {
            // Keep original step ingredient if no match found
            updatedStepIngredients.push(stepIngredient);
          }
        });
      }

      return {
        ...step,
        content: updatedContent,
        ingredients: updatedStepIngredients
      };
    });

    console.log('✅ Step content update completed');
    return updatedSteps;
  }

  /**
   * Update step content for a specific ingredient
   * @param {string} stepContent - Current step content
   * @param {Object} ingredient - Ingredient object
   * @param {Object} stepIngredient - Step ingredient object
   * @param {boolean} isFirstMention - Whether this is the first mention
   * @returns {string} Updated step content
   */
  static updateStepContentForIngredient(stepContent, ingredient, stepIngredient, isFirstMention) {
    const ingredientName = getIngredientName(ingredient);
    const originalName = stepIngredient.text || stepIngredient.id;
    
    if (!ingredientName || !originalName || originalName.length <= 2) {
      return stepContent;
    }

    // Build ingredient specification for first mention
    let simpleSpec = '';
    if (ingredient.structured && ingredient.structured.isStructured) {
      const { quantity, unit, ingredient: baseIngredient } = ingredient.structured;
      const parts = [];
      
      if (quantity !== null && quantity !== undefined) {
        parts.push(quantity.toString());
      }
      
      if (unit && unit.name) {
        const unitName = quantity === 1 ? unit.name : unit.plural;
        parts.push(unitName);
      }
      
      if (baseIngredient && baseIngredient.name) {
        parts.push(baseIngredient.name);
      }
      
      simpleSpec = parts.join(' ');
    } else {
      simpleSpec = getIngredientDisplayText(ingredient);
    }

    // Create regex for finding ingredient mentions
    const ingredientRegex = new RegExp(
      `\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 
      'gi'
    );

    // Check if ingredient appears in step content
    if (!ingredientRegex.test(stepContent)) {
      return stepContent;
    }

    // Check if step already has amount information
    const hasExactSpec = stepContent.includes(simpleSpec.trim());
    const amountBeforeIngredient = new RegExp(
      `\\d+[^.!?]*?${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 
      'i'
    );
    const alreadyHasAmount = hasExactSpec || amountBeforeIngredient.test(stepContent);

    let updatedContent = stepContent;

    if (isFirstMention && !alreadyHasAmount) {
      // First mention: replace with full specification
      updatedContent = stepContent.replace(ingredientRegex, simpleSpec.trim());
      console.log(`🔧 First mention updated: ${originalName} → ${simpleSpec.trim()}`);
    } else if (!isFirstMention && !alreadyHasAmount) {
      // Subsequent mentions: use just the ingredient name
      updatedContent = stepContent.replace(ingredientRegex, ingredientName);
      console.log(`🔧 Subsequent mention updated: ${originalName} → ${ingredientName}`);
    }

    return updatedContent;
  }

  /**
   * Find matching ingredient from ingredients array
   * @param {Object} stepIngredient - Step ingredient object
   * @param {Array} ingredients - Array of ingredients
   * @returns {Object|null} Matching ingredient or null
   */
  static findMatchingIngredient(stepIngredient, ingredients) {
    const searchText = stepIngredient.text || stepIngredient.id || '';
    
    // Try exact ID match first
    if (stepIngredient.id) {
      const exactMatch = ingredients.find(ing => ing.id === stepIngredient.id);
      if (exactMatch) return exactMatch;
    }

    // Try text-based matching
    return ingredients.find(ingredient => {
      const ingredientName = getIngredientName(ingredient);
      const displayText = getIngredientDisplayText(ingredient);
      
      return this.isIngredientMatch(searchText, ingredientName) ||
             this.isIngredientMatch(searchText, displayText) ||
             this.isIngredientMatch(searchText, ingredient.originalText);
    }) || null;
  }

  /**
   * Check if two ingredient texts match (case-insensitive, normalized)
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {boolean} True if texts match
   */
  static isIngredientMatch(text1, text2) {
    if (!text1 || !text2) return false;
    
    const normalize = (text) => text.toLowerCase().trim().replace(/\s+/g, ' ');
    return normalize(text1) === normalize(text2);
  }

  /**
   * Create step from ingredient action
   * @param {string} action - Action text
   * @param {Object} ingredient - Ingredient object
   * @returns {string} Step content
   */
  static createStepFromAction(action, ingredient) {
    if (!action || !ingredient) return '';

    const { convertToPresentTense, capitalizeFirst } = require('../utils/textUtils');
    const { getIngredientName, getIngredientAmount } = require('../utils/ingredientUtils');

    let stepContent = '';
    
    // Add action in present tense
    const presentTenseAction = convertToPresentTense(action);
    if (presentTenseAction) {
      stepContent += capitalizeFirst(presentTenseAction) + ' ';
    }
    
    // Add ingredient amount if available
    const amount = getIngredientAmount(ingredient);
    if (amount) {
      stepContent += amount + ' ';
    }
    
    // Add ingredient name
    const ingredientName = getIngredientName(ingredient);
    if (ingredientName) {
      stepContent += ingredientName;
    }
    
    return stepContent.trim();
  }
}