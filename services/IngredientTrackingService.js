/**
 * IngredientTrackingService
 * 
 * Manages ingredient tracking across recipe steps, including:
 * - First mention detection
 * - Amount display logic
 * - Real-time updates when steps are edited
 */

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Extract ingredient name from structured ingredient
function getIngredientName(ingredient) {
  if (!ingredient) return null;
  
  let name = ingredient.structured?.ingredient?.name || 
             extractIngredientNameFromSpec(ingredient.displayText || ingredient.originalText);
  
  // Handle divided ingredients - remove "divided" from the name for tracking
  if (name && typeof name === 'string') {
    name = name.replace(/,?\s*divided\s*$/i, '').trim();
  }
  
  return name;
}

// Extract ingredient name from text specification
function extractIngredientNameFromSpec(ingredientSpec) {
  if (!ingredientSpec || typeof ingredientSpec !== 'string') return null;
  
  // Match pattern: amount + unit + ingredient name
  const match = ingredientSpec.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)\s+(.+)/i);
  
  if (match) {
    let name = match[3].trim();
    // Remove preparation methods and "divided" notation
    name = name.split(',')[0].trim(); // Take only the first part before comma
    name = name.replace(/,?\s*divided\s*$/i, '').trim();
    return name;
  }
  
  // If no pattern match, try to extract from simple format
  let name = ingredientSpec.trim();
  // Remove common preparations after comma
  name = name.split(',')[0].trim();
  // Remove "divided" notation
  name = name.replace(/,?\s*divided\s*$/i, '').trim();
  
  return name;
}

/**
 * Update ingredient tracking for a recipe
 * @param {Array} steps - Recipe steps
 * @param {Array} ingredientsList - Main ingredients list
 * @returns {Object} Updated steps with tracking info and ingredient tracker
 */
export function updateIngredientTracking(steps, ingredientsList = []) {
  const usedIngredients = new Map(); // Track ingredient name -> first occurrence info
  
  // Process each step to update ingredient tracking
  const updatedSteps = steps.map((step, stepIndex) => {
    const ingredients = step.ingredients || [];
    const processedIngredients = [];
    
    ingredients.forEach(ingredientRef => {
      let ingredientName, ingredientId, fullSpec;
      
      // Handle different ingredient reference formats
      if (ingredientRef && typeof ingredientRef === 'object') {
        // Already has tracking info - update it
        ingredientId = ingredientRef.id;
        ingredientName = ingredientRef.text;
        fullSpec = ingredientRef.fullText;
        
        // Re-find the ingredient to ensure we have latest data
        if (ingredientId) {
          const ingredient = ingredientsList.find(ing => ing.id === ingredientId);
          if (ingredient) {
            ingredientName = getIngredientName(ingredient);
            fullSpec = ingredient.displayText || ingredient.originalText;
          }
        }
      } else if (typeof ingredientRef === 'string' && ingredientRef.startsWith('ing-')) {
        // Ingredient ID reference
        const ingredient = ingredientsList.find(ing => ing.id === ingredientRef);
        if (ingredient) {
          ingredientId = ingredient.id;
          ingredientName = getIngredientName(ingredient);
          fullSpec = ingredient.displayText || ingredient.originalText;
        } else {
          // Fallback if ingredient not found
          processedIngredients.push(ingredientRef);
          return;
        }
      } else {
        // Text-based ingredient - try to match with ingredients list
        const textSpec = ingredientRef;
        ingredientName = extractIngredientNameFromSpec(textSpec);
        fullSpec = textSpec;
        
        // Try to find matching ingredient in list
        const matchingIngredient = ingredientsList.find(ing => {
          const name = getIngredientName(ing);
          return name && name.toLowerCase() === ingredientName.toLowerCase();
        });
        
        if (matchingIngredient) {
          ingredientId = matchingIngredient.id;
          fullSpec = matchingIngredient.displayText || matchingIngredient.originalText;
        }
      }
      
      const lowerKey = ingredientName ? ingredientName.toLowerCase() : '';
      
      if (lowerKey && usedIngredients.has(lowerKey)) {
        // Already used - store reference with firstMention flag
        processedIngredients.push({
          id: ingredientId || null,
          text: ingredientName,
          fullText: fullSpec,
          isFirstMention: false,
          firstMentionStepId: usedIngredients.get(lowerKey).firstStep
        });
      } else if (lowerKey) {
        // First occurrence - show full specification with amount
        usedIngredients.set(lowerKey, {
          firstStep: step.id,
          stepIndex: stepIndex,
          ingredientId: ingredientId
        });
        processedIngredients.push({
          id: ingredientId || null,
          text: fullSpec,
          fullText: fullSpec,
          isFirstMention: true,
          firstMentionStepId: step.id
        });
      } else {
        // Couldn't process - keep original
        processedIngredients.push(ingredientRef);
      }
    });
    
    return {
      ...step,
      ingredients: processedIngredients,
      ingredientTracking: {
        hasTrackedIngredients: true,
        trackingVersion: '2.0'
      }
    };
  });
  
  // Build ingredient tracker
  const ingredientTracker = {};
  
  usedIngredients.forEach((info, ingredientName) => {
    const key = info.ingredientId || ingredientName;
    
    // Find the original ingredient to get amount info
    let amount = null;
    let unit = null;
    
    if (info.ingredientId) {
      const originalIngredient = ingredientsList.find(ing => ing.id === info.ingredientId);
      if (originalIngredient?.structured) {
        amount = originalIngredient.structured.quantity;
        unit = originalIngredient.structured.unit;
      }
    }
    
    ingredientTracker[key] = {
      firstMentionStepId: info.firstStep,
      stepOrder: info.stepIndex,
      amount: amount,
      unit: unit,
      ingredientName: ingredientName
    };
  });
  
  return {
    steps: updatedSteps,
    ingredientTracker
  };
}

/**
 * Parse step content to find ingredient references
 * @param {string} stepContent - The step text content
 * @param {Array} ingredientsList - Main ingredients list
 * @returns {Array} Array of ingredient IDs found in the step
 */
export function findIngredientsInStep(stepContent, ingredientsList = []) {
  const foundIngredients = [];
  
  ingredientsList.forEach(ingredient => {
    const ingredientName = getIngredientName(ingredient);
    
    if (!ingredientName) return;
    
    const regex = new RegExp(`\\b${escapeRegExp(ingredientName)}\\b`, 'gi');
    if (regex.test(stepContent)) {
      foundIngredients.push(ingredient.id);
    }
  });
  
  return foundIngredients;
}

/**
 * Generate steps from ingredients list
 * @param {Array} ingredientsList - Main ingredients list
 * @param {boolean} includeTracking - Whether to include tracking info
 * @returns {Array} Generated steps
 */
export function generateStepsFromIngredients(ingredientsList, includeTracking = true) {
  const steps = [];
  const usedIngredients = new Map();
  
  ingredientsList.forEach((ingredient, index) => {
    const ingredientName = getIngredientName(ingredient);
    const fullSpec = ingredient.displayText || ingredient.originalText;
    
    if (!ingredientName) return;
    
    const lowerKey = ingredientName.toLowerCase();
    
    // Create step content
    let stepContent = `Prepare ${fullSpec}`;
    if (ingredient.structured?.preparation?.name) {
      stepContent = `${ingredient.structured.preparation.name} ${fullSpec}`;
    }
    
    const stepId = `auto_${ingredient.id}_${index}`;
    
    // Build ingredient reference with tracking
    let ingredientRef;
    if (includeTracking) {
      if (usedIngredients.has(lowerKey)) {
        ingredientRef = {
          id: ingredient.id,
          text: ingredientName,
          fullText: fullSpec,
          isFirstMention: false,
          firstMentionStepId: usedIngredients.get(lowerKey)
        };
      } else {
        usedIngredients.set(lowerKey, stepId);
        ingredientRef = {
          id: ingredient.id,
          text: fullSpec,
          fullText: fullSpec,
          isFirstMention: true,
          firstMentionStepId: stepId
        };
      }
    } else {
      ingredientRef = ingredient.id;
    }
    
    steps.push({
      id: stepId,
      content: stepContent,
      ingredients: [ingredientRef],
      isAutoGenerated: true,
      ingredientTracking: includeTracking ? {
        hasTrackedIngredients: true,
        trackingVersion: '2.0'
      } : undefined
    });
  });
  
  return steps;
}

export default {
  updateIngredientTracking,
  findIngredientsInStep,
  generateStepsFromIngredients
};