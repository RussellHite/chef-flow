// Recipe parsing engine for intelligent recipe conversion

// Common cooking actions that indicate prep steps (only action verbs, not descriptive nouns)
const PREP_ACTIONS = [
  'chop', 'chopped', 'dice', 'diced', 'slice', 'sliced', 'mince', 'minced',
  'grate', 'grated', 'shred', 'shredded', 'peel', 'peeled', 'crush', 'crushed',
  'julienne', 'julienned', 'cube', 'cubed', 'halved', 'quartered',
  'trim', 'trimmed', 'core', 'cored', 'pit', 'pitted', 'seed', 'seeded',
  'sift', 'sifted', 'drain', 'drained', 'rinse', 'rinsed', 'pat dry', 'dried',
  'juiced'
];

// Descriptive forms that are NOT actions (ingredient states/forms)
const INGREDIENT_FORMS = [
  'halves', 'quarters', 'pieces', 'slices', 'chunks', 'strips', 'wedges'
];

// Common measurements and quantities (supports ranges like 2-3, 2 to 3, 2-3/4, and parenthetical sizes like 2 (5 ounce))
const MEASUREMENT_REGEX = /(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)/gi;

// Time extraction patterns
const TIME_REGEX = /(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/gi;

// Repetition patterns
const REPETITION_REGEX = /(repeat|continue|for each|do this|again)\s*(\d+)?\s*(times?|more times?)?/gi;

// Divided ingredient pattern
const DIVIDED_REGEX = /,?\s*(divided|split)\s*$/gi;

import ingredientService from '../services/ingredientServiceInstance.js';

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process ingredients text into structured ingredient objects
 * @param {string} ingredientsText - Raw ingredients text from input field
 * @returns {Promise<Array>} Array of structured ingredient objects
 */
export async function processIngredients(ingredientsText) {
  if (!ingredientsText || !ingredientsText.trim()) {
    return [];
  }
  
  const lines = ingredientsText
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const structuredIngredients = [];
  
  for (const line of lines) {
    try {
      const structured = await ingredientService.parseIngredientText(line);
      structuredIngredients.push({
        id: `ingredient_${Date.now()}_${Math.random()}`,
        originalText: line,
        structured: structured,
        displayText: structured.isStructured 
          ? ingredientService.formatIngredientForDisplay(structured)
          : line
      });
    } catch (error) {
      // Fallback to original text if parsing fails
      structuredIngredients.push({
        id: `ingredient_${Date.now()}_${Math.random()}`,
        originalText: line,
        structured: null,
        displayText: line
      });
    }
  }
  
  return structuredIngredients;
}

/**
 * Main recipe parsing function
 * @param {string} title - Recipe title
 * @param {string} content - Raw recipe content (usually just steps)
 * @param {string} ingredientsText - Ingredients from input field (optional)
 * @returns {Promise<Object>} Parsed recipe with structured steps
 */
export async function parseRecipe(title, content, ingredientsText = '') {
  // Clean and normalize input - remove section headers
  let cleanContent = content.trim().replace(/\r\n/g, '\n');
  
  // Remove common section headers (case insensitive) and any numbers following them
  cleanContent = cleanContent.replace(/^(ingredients?:?\s*\d*\s*)/gmi, '');
  cleanContent = cleanContent.replace(/^(steps?:?\s*\d*\s*)/gmi, '');
  cleanContent = cleanContent.replace(/^(instructions?:?\s*\d*\s*)/gmi, '');
  cleanContent = cleanContent.replace(/^(directions?:?\s*\d*\s*)/gmi, '');
  cleanContent = cleanContent.replace(/^(method:?\s*\d*\s*)/gmi, '');
  cleanContent = cleanContent.replace(/^(preparation:?\s*\d*\s*)/gmi, '');
  
  // Remove multiple blank lines
  cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Process ingredients from input field
  const ingredientsList = await processIngredients(ingredientsText);
  
  // Extract ingredients and their actions (for prep steps only)
  const ingredientMap = extractIngredientsForPrepSteps(ingredientsText);
  
  // Parse content into logical steps
  const rawSteps = parseSteps(cleanContent);
  
  // Process steps with intelligent parsing, linking to ingredient IDs
  const processedSteps = [];
  rawSteps.forEach((step, index) => {
    const result = processStep(step, index, ingredientMap, ingredientsList);
    if (Array.isArray(result)) {
      processedSteps.push(...result);
    } else {
      processedSteps.push(result);
    }
  });
  
  // Add prep steps for ingredients with embedded actions
  const prepSteps = generatePrepSteps(ingredientMap, ingredientsList);
  
  // Combine prep steps with cooking steps
  const allSteps = [...prepSteps, ...processedSteps];
  
  // Handle divided ingredients
  const stepsWithDividedIngredients = distributeDividedIngredients(allSteps, ingredientMap);
  
  // Deduplicate ingredients across steps with enhanced tracking
  const deduplicatedSteps = deduplicateIngredients(stepsWithDividedIngredients, ingredientsList);
  
  // Build ingredient tracker for the recipe
  const ingredientTracker = buildIngredientTracker(deduplicatedSteps, ingredientsList);
  
  // Extract timing information
  const totalTime = calculateTotalTime(deduplicatedSteps);

  return {
    id: Date.now().toString(),
    title: title.trim(),
    originalContent: content,
    steps: deduplicatedSteps,
    totalTime: totalTime,
    servings: extractServings(cleanContent),
    createdAt: new Date().toISOString(),
    ingredients: ingredientsList,
    ingredientTracker,
  };
}

/**
 * Extract ingredients for prep steps only
 */
function extractIngredientsForPrepSteps(ingredientsText) {
  const ingredientMap = {};
  
  if (!ingredientsText || !ingredientsText.trim()) {
    return ingredientMap;
  }
  
  const lines = ingredientsText.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Look for ingredient patterns with measurements
    const measurementMatch = trimmedLine.match(MEASUREMENT_REGEX);
    if (measurementMatch) {
      // Extract ingredient name and any prep actions
      const parts = trimmedLine.split(',');
      const mainPart = parts[0];
      
      // Check for prep actions in subsequent parts (exclude ingredient forms)
      const prepActions = [];
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim().toLowerCase();
        
        // Skip if this part contains ingredient forms (descriptive, not actions)
        const hasIngredientForm = INGREDIENT_FORMS.some(form => part.includes(form));
        if (hasIngredientForm) {
          continue;
        }
        
        // Look for actual prep actions
        for (const action of PREP_ACTIONS) {
          if (part.includes(action)) {
            prepActions.push(action);
          }
        }
      }
      
      // Extract ingredient name
      let ingredientName = mainPart.replace(MEASUREMENT_REGEX, '').trim();
      
      // Check if ingredient is divided
      const isDivided = DIVIDED_REGEX.test(ingredientName);
      if (isDivided) {
        ingredientName = ingredientName.replace(DIVIDED_REGEX, '').trim();
      }
      
      if (ingredientName) {
        const normalizedQuantity = normalizeQuantityRange(measurementMatch[0]);
        
        ingredientMap[ingredientName] = {
          quantity: normalizedQuantity,
          originalQuantity: measurementMatch[0],
          prepActions: prepActions,
          originalLine: trimmedLine,
          isDivided: isDivided,
        };
      }
    }
  });
  
  return ingredientMap;
}

/**
 * Parse content into logical steps
 */
function parseSteps(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const steps = [];
  
  // Check if content has numbered steps
  const hasNumberedSteps = lines.some(line => /^\d+\./.test(line.trim()));
  
  if (hasNumberedSteps) {
    // Parse numbered steps - each numbered item becomes one step
    let currentStep = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (/^\d+\./.test(trimmedLine)) {
        if (currentStep) {
          steps.push(currentStep.trim());
        }
        currentStep = trimmedLine.replace(/^\d+\.\s*/, '');
      } else if (currentStep) {
        // Continue current step on next line
        currentStep += ' ' + trimmedLine;
      }
    });
    
    if (currentStep) {
      steps.push(currentStep.trim());
    }
  } else {
    // Parse paragraph-based content - each paragraph becomes one step
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    
    if (paragraphs.length > 1) {
      // Multiple paragraphs - each paragraph is a step
      steps.push(...paragraphs.map(p => p.trim().replace(/\n/g, ' ')));
    } else {
      // Single paragraph - split by sentence-ending punctuation as fallback
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      steps.push(...sentences.map(s => s.trim()));
    }
  }
  
  return steps.filter(step => step.length > 0);
}

/**
 * Process individual step with intelligent parsing
 */
function processStep(stepContent, index, ingredientMap, ingredientsList = []) {
  let processedContent = stepContent;
  const stepIngredients = [];
  
  // Find ingredients mentioned in this step and link to ingredient IDs
  ingredientsList.forEach(ingredient => {
    const ingredientName = ingredient.structured?.ingredient?.name || 
                          extractIngredientNameFromSpec(ingredient.displayText || ingredient.originalText);
    
    if (!ingredientName) return;
    
    const regex = new RegExp(`\\b${escapeRegExp(ingredientName)}\\b`, 'gi');
    if (regex.test(processedContent)) {
      // Add ingredient ID reference instead of text
      stepIngredients.push(ingredient.id);
    }
  });
  
  // Also check for ingredients from the ingredient map (for backward compatibility)
  Object.keys(ingredientMap).forEach(ingredientName => {
    const regex = new RegExp(`\\b${escapeRegExp(ingredientName)}\\b`, 'gi');
    if (regex.test(processedContent)) {
      // Find corresponding ingredient in list
      const matchingIngredient = ingredientsList.find(ing => {
        const name = ing.structured?.ingredient?.name || 
                    extractIngredientNameFromSpec(ing.displayText || ing.originalText);
        return name && name.toLowerCase() === ingredientName.toLowerCase();
      });
      
      if (matchingIngredient && !stepIngredients.includes(matchingIngredient.id)) {
        stepIngredients.push(matchingIngredient.id);
      } else if (!matchingIngredient) {
        // Fallback to text if no matching ingredient found
        const fullSpec = `${ingredientMap[ingredientName].quantity} ${ingredientName}`;
        if (!stepIngredients.includes(fullSpec)) {
          stepIngredients.push(fullSpec);
        }
      }
    }
  });
  
  // Extract timing from step
  const timing = extractStepTiming(processedContent);
  
  // Handle repetition patterns
  const expandedSteps = expandRepetitions(processedContent);
  
  if (expandedSteps.length > 1) {
    // Return multiple steps for repetitions
    return expandedSteps.map((content, i) => ({
      id: `step_${index}_${i}`,
      content: content,
      timing: timing,
      ingredients: i === 0 ? stepIngredients : [], // Only first step gets ingredients
    }));
  }
  
  return {
    id: `step_${index}`,
    content: processedContent,
    timing: timing,
    ingredients: stepIngredients,
  };
}

/**
 * Generate prep steps for ingredients with embedded actions
 */
function generatePrepSteps(ingredientMap, ingredientsList = []) {
  const prepSteps = [];
  
  Object.entries(ingredientMap).forEach(([ingredientName, data]) => {
    if (data.prepActions.length > 0) {
      // Find corresponding ingredient in list
      const matchingIngredient = ingredientsList.find(ing => {
        const name = ing.structured?.ingredient?.name || 
                    extractIngredientNameFromSpec(ing.displayText || ing.originalText);
        return name && name.toLowerCase() === ingredientName.toLowerCase();
      });
      
      const action = data.prepActions[0]; // Use first action found
      const stepContent = `${capitalizeFirst(action)} ${data.quantity} ${ingredientName}`;
      
      prepSteps.push({
        id: `prep_${Date.now()}_${ingredientName.replace(/\s+/g, '_')}`,
        content: stepContent,
        timing: null,
        ingredients: matchingIngredient ? [matchingIngredient.id] : [`${data.quantity} ${ingredientName}`],
        isPrep: true,
      });
    }
  });
  
  return prepSteps;
}

/**
 * Extract timing from step content
 */
function extractStepTiming(content) {
  const timeMatch = content.match(TIME_REGEX);
  if (timeMatch) {
    const timeStr = timeMatch[0];
    // Convert ranges to lower bound (e.g., "5-7 minutes" becomes "5 minutes")
    return timeStr.replace(/(\d+)-\d+/, '$1');
  }
  return null;
}

/**
 * Expand repetition patterns into individual steps
 */
function expandRepetitions(content) {
  const repetitionMatch = content.match(REPETITION_REGEX);
  if (repetitionMatch) {
    const timesMatch = content.match(/(\d+)\s*times?/);
    const repeatCount = timesMatch ? parseInt(timesMatch[1]) : 3; // Default to 3 if no number
    
    const baseContent = content.replace(REPETITION_REGEX, '').trim();
    const steps = [];
    
    for (let i = 0; i < repeatCount; i++) {
      steps.push(`${baseContent} (${i + 1}/${repeatCount})`);
    }
    
    return steps;
  }
  
  return [content];
}

/**
 * Distribute divided ingredients across steps with calculated amounts
 */
function distributeDividedIngredients(steps, ingredientMap) {
  // Find divided ingredients and determine if they should actually be divided
  const dividedIngredients = {};
  
  Object.entries(ingredientMap).forEach(([ingredient, data]) => {
    if (data.isDivided) {
      // Check if steps mention partial amounts (half, remaining, rest, etc.)
      const stepsWithPartialReferences = steps.filter(step => {
        const stepText = step.content.toLowerCase();
        const hasIngredient = stepText.includes(ingredient.toLowerCase());
        const hasPartialReference = /\b(half|remaining|rest|some|part|portion)\b/.test(stepText);
        return hasIngredient && hasPartialReference;
      });
      
      // Only treat as truly divided if there are partial references
      if (stepsWithPartialReferences.length > 0) {
        // Count total steps that mention this ingredient
        const stepCount = steps.filter(step => {
          const stepText = step.content.toLowerCase();
          return stepText.includes(ingredient.toLowerCase());
        }).length;
        
        if (stepCount > 1) {
          dividedIngredients[ingredient] = {
            ...data,
            stepCount: stepCount,
            distributedAmount: calculateDividedAmount(data.quantity, stepCount)
          };
        }
      }
    }
  });
  
  // Update steps with distributed amounts
  return steps.map(step => {
    const updatedIngredients = step.ingredients.map(ingredientSpec => {
      // Find which ingredient this spec refers to
      for (const [ingredient, dividedData] of Object.entries(dividedIngredients)) {
        if (ingredientSpec.toLowerCase().includes(ingredient.toLowerCase())) {
          // Replace the full amount with the distributed amount
          return `${dividedData.distributedAmount} ${ingredient}`;
        }
      }
      return ingredientSpec;
    });
    
    return {
      ...step,
      ingredients: updatedIngredients
    };
  });
}

/**
 * Calculate divided amount for each step
 */
function calculateDividedAmount(totalQuantity, stepCount) {
  // Parse the quantity to handle fractions and decimals
  const numericPart = totalQuantity.match(/(\d+(?:\.\d+)?(?:\/\d+)?)/);
  
  if (numericPart) {
    let amount = parseFloat(numericPart[1]);
    
    // Handle fractions like "1/2"
    if (numericPart[1].includes('/')) {
      const [num, den] = numericPart[1].split('/').map(Number);
      amount = num / den;
    }
    
    const dividedAmount = amount / stepCount;
    
    // Format the result nicely
    if (dividedAmount % 1 === 0) {
      // Whole number
      return totalQuantity.replace(numericPart[1], dividedAmount.toString());
    } else if (dividedAmount >= 1) {
      // Decimal
      return totalQuantity.replace(numericPart[1], dividedAmount.toFixed(2));
    } else {
      // Convert to fraction for small amounts
      const fraction = convertToFraction(dividedAmount);
      return totalQuantity.replace(numericPart[1], fraction);
    }
  }
  
  // Fallback: just indicate it's divided
  return `${totalQuantity} (divided by ${stepCount})`;
}

/**
 * Convert decimal to common cooking fraction
 */
function convertToFraction(decimal) {
  const commonFractions = [
    [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.375, '3/8'],
    [0.5, '1/2'], [0.625, '5/8'], [0.667, '2/3'], [0.75, '3/4'], [0.875, '7/8']
  ];
  
  for (const [value, fraction] of commonFractions) {
    if (Math.abs(decimal - value) < 0.02) { // Small tolerance
      return fraction;
    }
  }
  
  // If no common fraction matches, return decimal rounded to 2 places
  return decimal.toFixed(2);
}

/**
 * Remove duplicate ingredients across steps - show full amount only in first mention
 * Enhanced to support both text-based and ID-based ingredients
 */
function deduplicateIngredients(steps, ingredientsList = []) {
  const usedIngredients = new Map(); // Track ingredient name -> first occurrence info
  
  try {
    if (!steps || !Array.isArray(steps)) {
      return [];
    }
    
    return steps.map(step => {
      if (!step) {
        return step;
      }
      
      const ingredients = step.ingredients || [];
      const processedIngredients = [];
      
      ingredients.forEach(ingredientSpec => {
        try {
          if (!ingredientSpec) {
            return;
          }
          
          let ingredientName, ingredientId, fullSpec;
          
          // Check if this is an ingredient ID reference
          if (typeof ingredientSpec === 'string' && ingredientSpec.startsWith('ing-')) {
            // Find the ingredient in the ingredients list
            const ingredient = Array.isArray(ingredientsList) ? 
              ingredientsList.find(ing => ing && ing.id === ingredientSpec) : null;
            if (ingredient) {
              ingredientId = ingredient.id;
              ingredientName = ingredient.structured?.ingredient?.name || 
                              extractIngredientNameFromSpec(ingredient.displayText || ingredient.originalText);
              fullSpec = ingredient.displayText || ingredient.originalText;
            } else {
              // Fallback if ingredient not found
              processedIngredients.push(ingredientSpec);
              return;
            }
          } else if (typeof ingredientSpec === 'string') {
            // Text-based ingredient specification
            ingredientName = extractIngredientNameFromSpec(ingredientSpec);
            fullSpec = ingredientSpec;
          } else {
            // Unknown format - keep as is
            processedIngredients.push(ingredientSpec);
            return;
          }
          
          if (!ingredientName) {
            processedIngredients.push(ingredientSpec);
            return;
          }
          
          const lowerKey = ingredientName.toLowerCase();
          
          if (usedIngredients.has(lowerKey)) {
            // Already used - store reference with firstMention flag
            const firstMentionInfo = usedIngredients.get(lowerKey);
            processedIngredients.push({
              id: ingredientId || null,
              text: ingredientName,
              fullText: fullSpec,
              isFirstMention: false,
              firstMentionStepId: firstMentionInfo ? firstMentionInfo.firstStep : null
            });
          } else {
            // First occurrence - show full specification with amount
            usedIngredients.set(lowerKey, {
              firstStep: step.id || `step_${Date.now()}`,
              isPrep: step.isPrep || false,
              ingredientId: ingredientId
            });
            processedIngredients.push({
              id: ingredientId || null,
              text: fullSpec,
              fullText: fullSpec,
              isFirstMention: true,
              firstMentionStepId: step.id || `step_${Date.now()}`
            });
          }
        } catch (ingredientError) {
          console.warn('Error processing ingredient:', ingredientError);
          // Keep original ingredient spec on error
          processedIngredients.push(ingredientSpec);
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
  } catch (error) {
    console.warn('Error in deduplicateIngredients:', error);
    // Return original steps on error
    return steps || [];
  }
}

/**
 * Extract ingredient name from ingredient specification
 */
function extractIngredientNameFromSpec(ingredientSpec) {
  // Match pattern: amount + unit + ingredient name
  const match = ingredientSpec.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)\s+(.+)/i);
  
  if (match) {
    return match[3].trim(); // Return the ingredient name part
  }
  
  // If no pattern match, return the whole string (might be just ingredient name)
  return ingredientSpec.trim();
}

/**
 * Calculate total recipe time
 */
function calculateTotalTime(steps) {
  let totalMinutes = 0;
  
  steps.forEach(step => {
    if (step.timing) {
      const timeMatch = step.timing.match(/(\d+)/);
      if (timeMatch) {
        totalMinutes += parseInt(timeMatch[1]);
      }
    }
  });
  
  return totalMinutes > 0 ? `${totalMinutes} minutes` : null;
}

/**
 * Build ingredient tracker for the recipe
 * Maps ingredient names/IDs to their first mention location and amount
 */
function buildIngredientTracker(steps, ingredientsList) {
  const tracker = {};
  
  try {
    if (!steps || !Array.isArray(steps)) {
      return tracker;
    }
    
    steps.forEach((step, stepIndex) => {
      if (!step || !step.ingredients || !Array.isArray(step.ingredients)) return;
      
      step.ingredients.forEach(ingredient => {
        try {
          // Handle new ingredient tracking format
          if (ingredient && typeof ingredient === 'object' && ingredient.isFirstMention) {
            const key = ingredient.id || (ingredient.text ? ingredient.text.toLowerCase() : `unknown_${stepIndex}`);
            
            // Find the original ingredient to get amount info
            let amount = null;
            let unit = null;
            if (ingredient.id && Array.isArray(ingredientsList)) {
              const originalIngredient = ingredientsList.find(ing => ing && ing.id === ingredient.id);
              if (originalIngredient?.structured) {
                amount = originalIngredient.structured.quantity;
                unit = originalIngredient.structured.unit;
              }
            } else if (ingredient.fullText) {
              // Extract amount from text
              try {
                const amountMatch = ingredient.fullText.match(MEASUREMENT_REGEX);
                if (amountMatch) {
                  amount = amountMatch[1];
                  unit = amountMatch[2];
                }
              } catch (regexError) {
                console.warn('Error matching ingredient amount:', regexError);
              }
            }
            
            tracker[key] = {
              firstMentionStepId: step.id || `step_${stepIndex}`,
              stepOrder: stepIndex,
              amount: amount,
              unit: unit,
              fullText: ingredient.fullText || ingredient.text || ''
            };
          }
        } catch (innerError) {
          console.warn('Error processing ingredient in buildIngredientTracker:', innerError);
        }
      });
    });
  } catch (error) {
    console.warn('Error in buildIngredientTracker:', error);
  }
  
  return tracker;
}

/**
 * Extract serving information
 */
function extractServings(content) {
  const servingPatterns = [
    /serves?\s*(\d+)/gi,
    /(\d+)\s*servings?/gi,
    /makes?\s*(\d+)/gi,
    /yields?\s*(\d+)/gi,
  ];
  
  for (const pattern of servingPatterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

/**
 * Normalize quantity ranges (e.g., "2-3" or "2 to 3" becomes "2-3")
 */
function normalizeQuantityRange(quantity) {
  // Handle "X to Y" format
  if (quantity.includes(' to ')) {
    return quantity.replace(' to ', '-');
  }
  
  // Handle em dash or en dash
  if (quantity.includes('–')) {
    return quantity.replace('–', '-');
  }
  
  return quantity;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Test function with sample recipes
 */
export function testRecipeParser() {
  const sampleRecipe = `
    Chocolate Chip Cookies
    
    2 cups flour, sifted
    1 cup butter, softened
    1/2 cup brown sugar
    2 eggs
    1 tsp vanilla
    1 cup chocolate chips
    
    1. Preheat oven to 350°F.
    2. Mix butter and sugar for 3-5 minutes until fluffy.
    3. Add eggs and vanilla, mix well.
    4. Gradually add flour, mixing until combined.
    5. Fold in chocolate chips.
    6. Drop spoonfuls on baking sheet and bake for 10-12 minutes.
    7. Cool on wire rack.
    
    Makes 24 cookies
  `;
  
  const parsed = parseRecipe('Chocolate Chip Cookies', sampleRecipe);
  console.log('Parsed Recipe:', JSON.stringify(parsed, null, 2));
  return parsed;
}

/**
 * Test function for divided ingredients
 */
export function testDividedIngredients() {
  const ingredientsText = `1 lemon
2 cups flour, divided
1 cup sugar, divided`;
  
  const stepsText = `1. Zest the lemon and set aside.
2. Mix half the flour with half the sugar.
3. Juice the lemon into mixture.
4. Add remaining flour and remaining sugar and mix well.`;
  
  const parsed = parseRecipe('Pancakes', stepsText, ingredientsText);
  console.log('Divided Ingredients Test:', JSON.stringify(parsed, null, 2));
  return parsed;
}

/**
 * Test function for prep actions vs ingredient forms
 */
export function testPrepActions() {
  const ingredientsText = `2 apples, halves
3 tomatoes, quartered
1 onion, halved
4 carrots, sliced`;
  
  const stepsText = `1. Mix the apple halves with tomato quarters.
2. Add halved onion and sliced carrots.`;
  
  const parsed = parseRecipe('Salad', stepsText, ingredientsText);
  console.log('Prep Actions Test:', JSON.stringify(parsed, null, 2));
  return parsed;
}