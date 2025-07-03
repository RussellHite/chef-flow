/**
 * Text Utility Functions
 * 
 * Helper functions for text manipulation and formatting
 */

/**
 * Convert action verbs to present tense for step instructions
 * @param {string} action - Action text to convert
 * @returns {string} Present tense version of the action
 */
export const convertToPresentTense = (action) => {
  if (!action || typeof action !== 'string') return '';
  
  // Common cooking verb conversions
  const verbMap = {
    // Past tense to present tense
    'chopped': 'chop',
    'diced': 'dice',
    'sliced': 'slice',
    'minced': 'mince',
    'grated': 'grate',
    'shredded': 'shred',
    'peeled': 'peel',
    'crushed': 'crush',
    'julienned': 'julienne',
    'cubed': 'cube',
    'halved': 'halve',
    'quartered': 'quarter',
    'trimmed': 'trim',
    'cored': 'core',
    'pitted': 'pit',
    'seeded': 'seed',
    'sifted': 'sift',
    'drained': 'drain',
    'rinsed': 'rinse',
    'dried': 'dry',
    'juiced': 'juice',
    'cooked': 'cook',
    'roasted': 'roast',
    'grilled': 'grill',
    'steamed': 'steam',
    'boiled': 'boil',
    'fried': 'fry',
    'sautéed': 'sauté',
    'baked': 'bake',
    'broiled': 'broil',
    'melted': 'melt',
    'heated': 'heat',
    'mixed': 'mix',
    'stirred': 'stir',
    'beaten': 'beat',
    'whisked': 'whisk',
    'folded': 'fold',
    'combined': 'combine',
    
    // Gerund (-ing) to present tense
    'chopping': 'chop',
    'dicing': 'dice',
    'slicing': 'slice',
    'mincing': 'mince',
    'grating': 'grate',
    'shredding': 'shred',
    'peeling': 'peel',
    'crushing': 'crush',
    'mixing': 'mix',
    'stirring': 'stir',
    'cooking': 'cook',
    'heating': 'heat',
    'beating': 'beat',
    'whisking': 'whisk',
    'folding': 'fold',
    'combining': 'combine'
  };
  
  try {
    // Split action into words and convert each verb
    const words = action.toLowerCase().split(/\s+/);
    const convertedWords = words.map(word => {
      // Remove common punctuation
      const cleanWord = word.replace(/[,.]$/, '');
      const punctuation = word.match(/[,.]$/) ? word.slice(-1) : '';
      
      // Check if word is in our verb map
      if (verbMap[cleanWord]) {
        return verbMap[cleanWord] + punctuation;
      }
      
      // Handle regular past tense (-ed ending)
      if (cleanWord.endsWith('ed') && cleanWord.length > 3) {
        let base = cleanWord.slice(0, -2);
        // Handle doubled consonants (e.g., 'chopped' -> 'chop')
        if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
          base = base.slice(0, -1);
        }
        return base + punctuation;
      }
      
      // Return original word if no conversion needed
      return word;
    });
    
    return convertedWords.join(' ');
  } catch (error) {
    console.warn('Error converting verb to present tense:', error);
    return action; // Return original action if conversion fails
  }
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} String with first letter capitalized
 */
export const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Clean up text by removing extra whitespace and normalizing
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Extract cooking time from step text (basic heuristic)
 * @param {string} stepText - Step content text
 * @returns {number|null} Time in minutes, or null if not found
 */
export const extractTimeFromStep = (stepText) => {
  if (!stepText || typeof stepText !== 'string') return null;
  
  const timePatterns = [
    /(\d+)\s*minutes?/i,
    /(\d+)\s*mins?/i,
    /(\d+)\s*hours?/i,
    /(\d+)\s*hrs?/i
  ];
  
  for (const pattern of timePatterns) {
    const match = stepText.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      // Convert hours to minutes
      if (pattern.source.includes('hour') || pattern.source.includes('hr')) {
        return value * 60;
      }
      return value;
    }
  }
  
  return null;
};

/**
 * Format time duration for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export const formatDuration = (minutes) => {
  if (!minutes || typeof minutes !== 'number' || minutes <= 0) {
    return '';
  }
  
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};