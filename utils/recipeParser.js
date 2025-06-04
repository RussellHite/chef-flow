// Recipe parsing engine for intelligent recipe conversion

// Common cooking actions that indicate prep steps
const PREP_ACTIONS = [
  'chop', 'chopped', 'dice', 'diced', 'slice', 'sliced', 'mince', 'minced',
  'grate', 'grated', 'shred', 'shredded', 'peel', 'peeled', 'crush', 'crushed',
  'julienne', 'julienned', 'cube', 'cubed', 'halve', 'halved', 'quarter', 'quartered',
  'trim', 'trimmed', 'core', 'cored', 'pit', 'pitted', 'seed', 'seeded',
  'sift', 'sifted', 'drain', 'drained', 'rinse', 'rinsed', 'pat dry', 'dried'
];

// Common measurements and quantities (supports ranges like 2-3, 2 to 3, 2-3/4)
const MEASUREMENT_REGEX = /(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small)/gi;

// Time extraction patterns
const TIME_REGEX = /(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/gi;

// Repetition patterns
const REPETITION_REGEX = /(repeat|continue|for each|do this|again)\s*(\d+)?\s*(times?|more times?)?/gi;

/**
 * Main recipe parsing function
 * @param {string} title - Recipe title
 * @param {string} content - Raw recipe content
 * @returns {Object} Parsed recipe with structured steps
 */
export function parseRecipe(title, content) {
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
  
  // Extract ingredients and their actions
  const ingredientMap = extractIngredients(cleanContent);
  
  // Parse content into logical steps
  const rawSteps = parseSteps(cleanContent);
  
  // Process steps with intelligent parsing
  const processedSteps = [];
  rawSteps.forEach((step, index) => {
    const result = processStep(step, index, ingredientMap);
    if (Array.isArray(result)) {
      processedSteps.push(...result);
    } else {
      processedSteps.push(result);
    }
  });
  
  // Add prep steps for ingredients with embedded actions
  const prepSteps = generatePrepSteps(ingredientMap);
  
  // Combine prep steps with cooking steps
  const allSteps = [...prepSteps, ...processedSteps];
  
  // Deduplicate ingredients across steps
  const deduplicatedSteps = deduplicateIngredients(allSteps);
  
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
    ingredients: Object.keys(ingredientMap),
  };
}

/**
 * Extract ingredients and their preparation actions
 */
function extractIngredients(content) {
  const ingredientMap = {};
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Look for ingredient patterns
    const measurementMatch = trimmedLine.match(MEASUREMENT_REGEX);
    if (measurementMatch) {
      // Extract ingredient name and any prep actions
      const parts = trimmedLine.split(',');
      const mainPart = parts[0];
      
      // Check for prep actions in subsequent parts
      const prepActions = [];
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim().toLowerCase();
        for (const action of PREP_ACTIONS) {
          if (part.includes(action)) {
            prepActions.push(action);
          }
        }
      }
      
      // Extract ingredient name (remove measurement)
      const ingredientName = mainPart.replace(MEASUREMENT_REGEX, '').trim();
      if (ingredientName) {
        // Normalize the quantity to handle ranges
        const normalizedQuantity = normalizeQuantityRange(measurementMatch[0]);
        
        ingredientMap[ingredientName] = {
          quantity: normalizedQuantity,
          originalQuantity: measurementMatch[0],
          prepActions: prepActions,
          originalLine: trimmedLine,
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
    // Parse numbered steps
    let currentStep = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (/^\d+\./.test(trimmedLine)) {
        if (currentStep) {
          steps.push(currentStep.trim());
        }
        currentStep = trimmedLine.replace(/^\d+\.\s*/, '');
      } else if (currentStep) {
        currentStep += ' ' + trimmedLine;
      }
    });
    
    if (currentStep) {
      steps.push(currentStep.trim());
    }
  } else {
    // Parse paragraph or unstructured content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    steps.push(...sentences.map(s => s.trim()));
  }
  
  return steps.filter(step => step.length > 0);
}

/**
 * Process individual step with intelligent parsing
 */
function processStep(stepContent, index, ingredientMap) {
  let processedContent = stepContent;
  const stepIngredients = [];
  
  // Replace ingredient references with full specifications
  Object.keys(ingredientMap).forEach(ingredient => {
    const regex = new RegExp(`\\b${ingredient}\\b`, 'gi');
    if (regex.test(processedContent)) {
      const fullSpec = `${ingredientMap[ingredient].quantity} ${ingredient}`;
      stepIngredients.push(fullSpec);
      processedContent = processedContent.replace(regex, fullSpec);
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
function generatePrepSteps(ingredientMap) {
  const prepSteps = [];
  
  Object.entries(ingredientMap).forEach(([ingredient, data]) => {
    if (data.prepActions.length > 0) {
      const action = data.prepActions[0]; // Use first action found
      const stepContent = `${capitalizeFirst(action)} ${data.quantity} ${ingredient}`;
      
      prepSteps.push({
        id: `prep_${Date.now()}_${ingredient.replace(/\s+/g, '_')}`,
        content: stepContent,
        timing: null,
        ingredients: [`${data.quantity} ${ingredient}`],
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
 * Remove duplicate ingredients across steps
 */
function deduplicateIngredients(steps) {
  const usedIngredients = new Set();
  
  return steps.map(step => {
    const ingredients = step.ingredients || [];
    const filteredIngredients = ingredients.filter(ingredient => {
      const key = ingredient.toLowerCase();
      if (usedIngredients.has(key)) {
        return false;
      }
      usedIngredients.add(key);
      return true;
    });
    
    return {
      ...step,
      ingredients: filteredIngredients,
    };
  });
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