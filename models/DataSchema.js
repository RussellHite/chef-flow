/**
 * Data Schema for Ingredient Learning Data Collection
 * 
 * Vector-database-ready structure designed for future ML integration
 * Captures user interactions with ingredients for training and personalization
 */

import { nanoid } from 'nanoid/non-secure';

// Event types for ingredient interactions
export const EVENT_TYPES = {
  // Search & Discovery
  INGREDIENT_SEARCH: 'ingredient_search',
  SEARCH_RESULT_VIEW: 'search_result_view',
  SEARCH_RESULT_SELECT: 'search_result_select',
  
  // Selection & Usage
  INGREDIENT_SELECT: 'ingredient_select',
  INGREDIENT_DESELECT: 'ingredient_deselect',
  INGREDIENT_QUANTITY_CHANGE: 'ingredient_quantity_change',
  INGREDIENT_UNIT_CHANGE: 'ingredient_unit_change',
  
  // Corrections & Learning
  INGREDIENT_CORRECTION: 'ingredient_correction',
  INGREDIENT_SUGGESTION_ACCEPT: 'ingredient_suggestion_accept',
  INGREDIENT_SUGGESTION_REJECT: 'ingredient_suggestion_reject',
  
  // Combinations & Context
  INGREDIENT_COMBINATION: 'ingredient_combination',
  RECIPE_INGREDIENT_ADD: 'recipe_ingredient_add',
  MEAL_PLANNING: 'meal_planning',
  
  // Feedback & Preferences
  USER_FEEDBACK: 'user_feedback',
  PREFERENCE_UPDATE: 'preference_update',
  RATING_GIVEN: 'rating_given',
  
  // Session & Behavior
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  APP_STATE_CHANGE: 'app_state_change'
};

// Context types for understanding user intent
export const CONTEXT_TYPES = {
  RECIPE_CREATION: 'recipe_creation',
  RECIPE_EDITING: 'recipe_editing',
  MEAL_PLANNING: 'meal_planning',
  GROCERY_SHOPPING: 'grocery_shopping',
  NUTRITIONAL_ANALYSIS: 'nutritional_analysis',
  DIETARY_RESTRICTION: 'dietary_restriction',
  CUISINE_EXPLORATION: 'cuisine_exploration',
  COOKING_SESSION: 'cooking_session'
};

// Feedback types for user preferences
export const FEEDBACK_TYPES = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  LOVE: 'love',
  HATE: 'hate',
  NEUTRAL: 'neutral',
  DIETARY_RESTRICTION: 'dietary_restriction',
  ALLERGEN: 'allergen',
  PREFERENCE: 'preference'
};

/**
 * Base Event Schema
 * All events follow this structure for consistency and vector database readiness
 */
export const createBaseEvent = (eventType, data = {}) => ({
  // Core identifiers
  id: nanoid(),
  sessionId: data.sessionId || getCurrentSessionId(),
  timestamp: Date.now(),
  eventType,
  
  // Event data
  data: {
    ...data,
    // Always include app context
    appVersion: getAppVersion(),
    platform: getPlatform(),
    userAgent: getUserAgent()
  },
  
  // Vector database ready fields
  vectorReady: {
    searchQuery: null,        // Cleaned text for embedding
    ingredientContext: [],    // Related ingredients
    userIntent: null,         // Derived intent category
    semanticTags: [],         // Semantic categories
    confidence: 1.0           // Data quality score
  },
  
  // Sync management
  synced: false,
  syncAttempts: 0,
  lastSyncAttempt: null,
  
  // Privacy & compliance
  anonymized: false,
  consentGiven: true,
  retentionDate: null
});

/**
 * Specific Event Schemas
 */

// Ingredient Search Event
export const createIngredientSearchEvent = (query, results, context = {}) => {
  const baseEvent = createBaseEvent(EVENT_TYPES.INGREDIENT_SEARCH, {
    sessionId: context.sessionId,
    query: query.trim(),
    resultCount: results.length,
    hasResults: results.length > 0,
    searchContext: context.contextType || CONTEXT_TYPES.RECIPE_CREATION,
    searchDuration: context.searchDuration || 0,
    queryLength: query.length,
    isTypoCorrection: context.isTypoCorrection || false
  });
  
  // Prepare for vector embedding
  baseEvent.vectorReady = {
    searchQuery: cleanTextForEmbedding(query),
    ingredientContext: results.slice(0, 5).map(r => r.name), // Top 5 results
    userIntent: inferUserIntent(query, context),
    semanticTags: extractSemanticTags(query, results),
    confidence: calculateConfidence(query, results)
  };
  
  return baseEvent;
};

// Ingredient Selection Event
export const createIngredientSelectionEvent = (ingredient, context = {}) => {
  const baseEvent = createBaseEvent(EVENT_TYPES.INGREDIENT_SELECT, {
    sessionId: context.sessionId,
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    category: ingredient.category,
    quantity: context.quantity,
    unit: context.unit,
    preparationMethod: context.preparation,
    selectionOrder: context.selectionOrder || 1,
    totalIngredientsInContext: context.totalIngredients || 1,
    selectionTime: context.selectionTime || Date.now(),
    fromSuggestion: context.fromSuggestion || false
  });
  
  baseEvent.vectorReady = {
    searchQuery: ingredient.name,
    ingredientContext: context.relatedIngredients || [],
    userIntent: context.contextType || CONTEXT_TYPES.RECIPE_CREATION,
    semanticTags: [
      ingredient.category,
      ...(ingredient.cuisineTypes || []),
      ...(ingredient.dietaryTags || [])
    ],
    confidence: 0.9
  };
  
  return baseEvent;
};

// Ingredient Correction Event
export const createIngredientCorrectionEvent = (original, corrected, correctionType) => {
  const baseEvent = createBaseEvent(EVENT_TYPES.INGREDIENT_CORRECTION, {
    originalText: original.text || original.name,
    correctedText: corrected.text || corrected.name,
    correctionType, // 'name', 'quantity', 'unit', 'preparation'
    originalIngredient: original,
    correctedIngredient: corrected,
    editDistance: calculateEditDistance(original.text, corrected.text),
    confidenceImprovement: corrected.confidence - original.confidence
  });
  
  baseEvent.vectorReady = {
    searchQuery: `${original.text} -> ${corrected.text}`,
    ingredientContext: [original.name, corrected.name],
    userIntent: 'correction',
    semanticTags: ['correction', correctionType, original.category],
    confidence: 0.95 // High confidence for user corrections
  };
  
  return baseEvent;
};

// Ingredient Combination Event
export const createIngredientCombinationEvent = (ingredients, context = {}) => {
  const baseEvent = createBaseEvent(EVENT_TYPES.INGREDIENT_COMBINATION, {
    sessionId: context.sessionId,
    ingredients: ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      category: ing.category,
      quantity: ing.quantity,
      unit: ing.unit
    })),
    combinationSize: ingredients.length,
    cuisineType: context.cuisineType,
    mealType: context.mealType,
    dietaryRestrictions: context.dietaryRestrictions || [],
    cookingMethod: context.cookingMethod,
    difficulty: context.difficulty,
    estimatedTime: context.estimatedTime
  });
  
  baseEvent.vectorReady = {
    searchQuery: ingredients.map(i => i.name).join(' '),
    ingredientContext: ingredients.map(i => i.name),
    userIntent: context.contextType || CONTEXT_TYPES.RECIPE_CREATION,
    semanticTags: [
      ...ingredients.map(i => i.category),
      context.cuisineType,
      context.mealType,
      ...(context.dietaryRestrictions || [])
    ].filter(Boolean),
    confidence: 0.8
  };
  
  return baseEvent;
};

// User Feedback Event
export const createUserFeedbackEvent = (ingredient, feedbackType, rating = null, context = {}) => {
  const baseEvent = createBaseEvent(EVENT_TYPES.USER_FEEDBACK, {
    sessionId: context.sessionId,
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    feedbackType,
    rating,
    feedbackContext: context.contextType,
    previousRating: context.previousRating,
    feedbackReason: context.reason,
    isExplicitFeedback: context.isExplicit || true
  });
  
  baseEvent.vectorReady = {
    searchQuery: ingredient.name,
    ingredientContext: context.relatedIngredients || [],
    userIntent: 'feedback',
    semanticTags: [feedbackType, ingredient.category, 'user_preference'],
    confidence: context.isExplicit ? 0.9 : 0.6
  };
  
  return baseEvent;
};

// Session Event
export const createSessionEvent = (eventType, sessionData = {}) => {
  const baseEvent = createBaseEvent(eventType, {
    sessionDuration: sessionData.duration || 0,
    interactionCount: sessionData.interactionCount || 0,
    ingredientsViewed: sessionData.ingredientsViewed || 0,
    ingredientsSelected: sessionData.ingredientsSelected || 0,
    searchCount: sessionData.searchCount || 0,
    correctionCount: sessionData.correctionCount || 0,
    primaryContext: sessionData.primaryContext,
    completedTasks: sessionData.completedTasks || [],
    sessionQuality: sessionData.quality || 'good'
  });
  
  baseEvent.vectorReady = {
    searchQuery: null,
    ingredientContext: sessionData.topIngredients || [],
    userIntent: sessionData.primaryContext || 'general',
    semanticTags: ['session', sessionData.quality],
    confidence: 0.7
  };
  
  return baseEvent;
};

/**
 * Utility Functions
 */

// Get current session ID (implement based on your session management)
const getCurrentSessionId = () => {
  // This should be implemented to return current session ID
  // For now, return a simple timestamp-based ID
  return `session_${Date.now()}`;
};

// Clean text for embedding
const cleanTextForEmbedding = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Infer user intent from query and context
const inferUserIntent = (query, context) => {
  const lowerQuery = query.toLowerCase();
  
  if (context.contextType) return context.contextType;
  
  // Simple intent inference - can be enhanced with ML
  if (lowerQuery.includes('substitute') || lowerQuery.includes('replace')) {
    return 'substitution';
  }
  if (lowerQuery.includes('healthy') || lowerQuery.includes('diet')) {
    return 'dietary';
  }
  if (lowerQuery.includes('quick') || lowerQuery.includes('easy')) {
    return 'convenience';
  }
  
  return CONTEXT_TYPES.RECIPE_CREATION;
};

// Extract semantic tags
const extractSemanticTags = (query, results) => {
  const tags = [];
  const lowerQuery = query.toLowerCase();
  
  // Add query-based tags
  if (lowerQuery.includes('organic')) tags.push('organic');
  if (lowerQuery.includes('fresh')) tags.push('fresh');
  if (lowerQuery.includes('frozen')) tags.push('frozen');
  if (lowerQuery.includes('dried')) tags.push('dried');
  
  // Add result-based tags
  if (results.length > 0) {
    const categories = [...new Set(results.map(r => r.category).filter(Boolean))];
    tags.push(...categories.slice(0, 3)); // Top 3 categories
  }
  
  return tags;
};

// Calculate confidence score
const calculateConfidence = (query, results) => {
  if (results.length === 0) return 0.1;
  if (results.length === 1) return 0.9;
  if (results.length <= 5) return 0.8;
  return 0.6;
};

// Calculate edit distance for corrections
const calculateEditDistance = (str1, str2) => {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);
  
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Platform detection utilities
const getAppVersion = () => {
  // Implement based on your app's version management
  return '1.0.0';
};

const getPlatform = () => {
  // Return platform info
  return 'react-native';
};

const getUserAgent = () => {
  // Return user agent if available
  return 'chef-flow-mobile';
};

export default {
  EVENT_TYPES,
  CONTEXT_TYPES,
  FEEDBACK_TYPES,
  createBaseEvent,
  createIngredientSearchEvent,
  createIngredientSelectionEvent,
  createIngredientCorrectionEvent,
  createIngredientCombinationEvent,
  createUserFeedbackEvent,
  createSessionEvent
};