/**
 * Ingredient Data Collector Service
 * 
 * Main service class that handles all ingredient learning data collection
 * Provides high-level methods for tracking user interactions
 * Manages session lifecycle and event batching
 */

import { nanoid } from 'nanoid/non-secure';
import { getDataManager } from '../storage/LocalDataManager';
import {
  EVENT_TYPES,
  CONTEXT_TYPES,
  FEEDBACK_TYPES,
  createIngredientSearchEvent,
  createIngredientSelectionEvent,
  createIngredientCorrectionEvent,
  createIngredientCombinationEvent,
  createUserFeedbackEvent,
  createSessionEvent
} from '../models/DataSchema';

class IngredientDataCollector {
  constructor() {
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.sessionEvents = [];
    this.sessionMetrics = {
      interactionCount: 0,
      ingredientsViewed: new Set(),
      ingredientsSelected: new Set(),
      searchCount: 0,
      correctionCount: 0,
      feedbackCount: 0
    };
    this.dataManager = getDataManager();
    this.isInitialized = false;
    
    // Bind methods to preserve context
    this.trackIngredientSearch = this.trackIngredientSearch.bind(this);
    this.trackIngredientSelection = this.trackIngredientSelection.bind(this);
    this.trackIngredientCorrection = this.trackIngredientCorrection.bind(this);
    this.trackIngredientCombination = this.trackIngredientCombination.bind(this);
    this.trackUserFeedback = this.trackUserFeedback.bind(this);
    
    this.initialize();
  }

  /**
   * Initialize the data collector
   */
  async initialize() {
    try {
      // Check user preferences
      const preferences = await this.dataManager.getUserPreferences();
      
      if (!preferences.dataCollectionEnabled) {
        console.log('Data collection is disabled by user preference');
        return;
      }

      // Start initial session
      await this.startSession();
      
      this.isInitialized = true;
      console.log('IngredientDataCollector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IngredientDataCollector:', error);
    }
  }

  /**
   * Start a new tracking session
   * @param {Object} context - Session context information
   */
  async startSession(context = {}) {
    try {
      // End previous session if exists
      if (this.currentSessionId) {
        await this.endSession();
      }

      // Create new session
      this.currentSessionId = `session_${nanoid()}`;
      this.sessionStartTime = Date.now();
      this.sessionEvents = [];
      this.sessionMetrics = {
        interactionCount: 0,
        ingredientsViewed: new Set(),
        ingredientsSelected: new Set(),
        searchCount: 0,
        correctionCount: 0,
        feedbackCount: 0,
        primaryContext: context.contextType || CONTEXT_TYPES.RECIPE_CREATION
      };

      // Create session start event
      const sessionStartEvent = createSessionEvent(EVENT_TYPES.SESSION_START, {
        sessionId: this.currentSessionId,
        startContext: context,
        appState: context.appState || 'foreground'
      });

      await this.recordEvent(sessionStartEvent);
      
      console.log('Started new tracking session:', this.currentSessionId);
      return this.currentSessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }

  /**
   * End the current tracking session
   */
  async endSession() {
    if (!this.currentSessionId) {
      return;
    }

    try {
      const sessionDuration = Date.now() - this.sessionStartTime;
      
      // Create session end event
      const sessionEndEvent = createSessionEvent(EVENT_TYPES.SESSION_END, {
        sessionId: this.currentSessionId,
        duration: sessionDuration,
        interactionCount: this.sessionMetrics.interactionCount,
        ingredientsViewed: this.sessionMetrics.ingredientsViewed.size,
        ingredientsSelected: this.sessionMetrics.ingredientsSelected.size,
        searchCount: this.sessionMetrics.searchCount,
        correctionCount: this.sessionMetrics.correctionCount,
        feedbackCount: this.sessionMetrics.feedbackCount,
        primaryContext: this.sessionMetrics.primaryContext,
        topIngredients: Array.from(this.sessionMetrics.ingredientsViewed).slice(0, 10),
        quality: this.calculateSessionQuality()
      });

      await this.recordEvent(sessionEndEvent);
      
      console.log(`Ended session ${this.currentSessionId} after ${sessionDuration}ms`);
      
      // Clear session data
      this.currentSessionId = null;
      this.sessionStartTime = null;
      this.sessionEvents = [];
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Track ingredient search interactions
   * @param {string} query - Search query
   * @param {Array} results - Search results
   * @param {Object} context - Additional context
   */
  async trackIngredientSearch(query, results = [], context = {}) {
    if (!this.isEnabled()) return;

    try {
      const searchEvent = createIngredientSearchEvent(query, results, {
        sessionId: this.currentSessionId,
        ...context
      });

      await this.recordEvent(searchEvent);
      
      // Update session metrics
      this.sessionMetrics.searchCount++;
      this.sessionMetrics.interactionCount++;
      
      // Track viewed ingredients
      results.forEach(ingredient => {
        if (ingredient.id) {
          this.sessionMetrics.ingredientsViewed.add(ingredient.id);
        }
      });

      console.log(`Tracked search: "${query}" with ${results.length} results`);
      return true;
    } catch (error) {
      console.error('Failed to track ingredient search:', error);
      return false;
    }
  }

  /**
   * Track ingredient selection
   * @param {Object} ingredient - Selected ingredient
   * @param {Object} context - Selection context
   */
  async trackIngredientSelection(ingredient, context = {}) {
    if (!this.isEnabled()) return;

    try {
      const selectionEvent = createIngredientSelectionEvent(ingredient, {
        sessionId: this.currentSessionId,
        ...context
      });

      await this.recordEvent(selectionEvent);
      
      // Update session metrics
      this.sessionMetrics.interactionCount++;
      if (ingredient.id) {
        this.sessionMetrics.ingredientsSelected.add(ingredient.id);
        this.sessionMetrics.ingredientsViewed.add(ingredient.id);
      }

      console.log(`Tracked selection: ${ingredient.name}`);
      return true;
    } catch (error) {
      console.error('Failed to track ingredient selection:', error);
      return false;
    }
  }

  /**
   * Track ingredient corrections (valuable for ML training)
   * @param {Object} original - Original ingredient data
   * @param {Object} corrected - Corrected ingredient data
   * @param {string} correctionType - Type of correction
   */
  async trackIngredientCorrection(original, corrected, correctionType = 'name') {
    if (!this.isEnabled()) return;

    try {
      const correctionEvent = createIngredientCorrectionEvent(
        original, 
        corrected, 
        correctionType
      );
      correctionEvent.sessionId = this.currentSessionId;

      await this.recordEvent(correctionEvent);
      
      // Update session metrics
      this.sessionMetrics.correctionCount++;
      this.sessionMetrics.interactionCount++;

      console.log(`Tracked correction: ${original.text} -> ${corrected.text}`);
      return true;
    } catch (error) {
      console.error('Failed to track ingredient correction:', error);
      return false;
    }
  }

  /**
   * Track ingredient combinations (valuable for recommendation systems)
   * @param {Array} ingredients - Array of ingredients used together
   * @param {Object} context - Combination context
   */
  async trackIngredientCombination(ingredients, context = {}) {
    if (!this.isEnabled()) return;

    try {
      const combinationEvent = createIngredientCombinationEvent(ingredients, {
        sessionId: this.currentSessionId,
        ...context
      });

      await this.recordEvent(combinationEvent);
      
      // Update session metrics
      this.sessionMetrics.interactionCount++;
      ingredients.forEach(ingredient => {
        if (ingredient.id) {
          this.sessionMetrics.ingredientsSelected.add(ingredient.id);
          this.sessionMetrics.ingredientsViewed.add(ingredient.id);
        }
      });

      console.log(`Tracked combination: ${ingredients.map(i => i.name).join(', ')}`);
      return true;
    } catch (error) {
      console.error('Failed to track ingredient combination:', error);
      return false;
    }
  }

  /**
   * Track user feedback on ingredients
   * @param {Object} ingredient - Ingredient being rated
   * @param {string} feedbackType - Type of feedback
   * @param {number} rating - Numerical rating (optional)
   * @param {Object} context - Feedback context
   */
  async trackUserFeedback(ingredient, feedbackType, rating = null, context = {}) {
    if (!this.isEnabled()) return;

    try {
      const feedbackEvent = createUserFeedbackEvent(
        ingredient, 
        feedbackType, 
        rating, 
        {
          sessionId: this.currentSessionId,
          ...context
        }
      );

      await this.recordEvent(feedbackEvent);
      
      // Update session metrics
      this.sessionMetrics.feedbackCount++;
      this.sessionMetrics.interactionCount++;

      console.log(`Tracked feedback: ${ingredient.name} - ${feedbackType}`);
      return true;
    } catch (error) {
      console.error('Failed to track user feedback:', error);
      return false;
    }
  }

  /**
   * Track app state changes
   * @param {string} newState - New app state
   * @param {string} previousState - Previous app state
   */
  async trackAppStateChange(newState, previousState) {
    if (!this.isEnabled()) return;

    try {
      if (newState === 'background' && this.currentSessionId) {
        // App going to background - end session
        await this.endSession();
      } else if (newState === 'active' && !this.currentSessionId) {
        // App becoming active - start new session
        await this.startSession({ appState: newState });
      }

      console.log(`App state changed: ${previousState} -> ${newState}`);
      return true;
    } catch (error) {
      console.error('Failed to track app state change:', error);
      return false;
    }
  }

  /**
   * Batch track multiple interactions at once
   * @param {Array} interactions - Array of interaction objects
   */
  async trackBatch(interactions) {
    if (!this.isEnabled()) return;

    try {
      const events = [];
      
      for (const interaction of interactions) {
        let event = null;
        
        switch (interaction.type) {
          case 'search':
            event = createIngredientSearchEvent(
              interaction.query, 
              interaction.results, 
              { sessionId: this.currentSessionId, ...interaction.context }
            );
            break;
            
          case 'selection':
            event = createIngredientSelectionEvent(
              interaction.ingredient, 
              { sessionId: this.currentSessionId, ...interaction.context }
            );
            break;
            
          case 'correction':
            event = createIngredientCorrectionEvent(
              interaction.original,
              interaction.corrected,
              interaction.correctionType
            );
            event.sessionId = this.currentSessionId;
            break;
            
          case 'combination':
            event = createIngredientCombinationEvent(
              interaction.ingredients,
              { sessionId: this.currentSessionId, ...interaction.context }
            );
            break;
            
          case 'feedback':
            event = createUserFeedbackEvent(
              interaction.ingredient,
              interaction.feedbackType,
              interaction.rating,
              { sessionId: this.currentSessionId, ...interaction.context }
            );
            break;
        }
        
        if (event) {
          events.push(event);
        }
      }

      if (events.length > 0) {
        await this.dataManager.storeEventsBatch(events);
        this.sessionEvents.push(...events);
      }

      console.log(`Tracked batch of ${events.length} interactions`);
      return true;
    } catch (error) {
      console.error('Failed to track batch interactions:', error);
      return false;
    }
  }

  /**
   * Get analytics data for the current session
   */
  getCurrentSessionAnalytics() {
    if (!this.currentSessionId) {
      return null;
    }

    return {
      sessionId: this.currentSessionId,
      duration: Date.now() - this.sessionStartTime,
      metrics: {
        ...this.sessionMetrics,
        ingredientsViewed: this.sessionMetrics.ingredientsViewed.size,
        ingredientsSelected: this.sessionMetrics.ingredientsSelected.size
      },
      eventCount: this.sessionEvents.length,
      quality: this.calculateSessionQuality()
    };
  }

  /**
   * Get historical analytics data
   * @param {Object} criteria - Search criteria
   */
  async getAnalytics(criteria = {}) {
    try {
      const events = await this.dataManager.getEvents(criteria);
      return this.calculateAnalytics(events);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  /**
   * Export data for analysis or backup
   * @param {Object} options - Export options
   */
  async exportData(options = {}) {
    try {
      return await this.dataManager.exportData(options);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Get data collection settings
   */
  async getSettings() {
    try {
      return await this.dataManager.getUserPreferences();
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  /**
   * Update data collection settings
   * @param {Object} settings - New settings
   */
  async updateSettings(settings) {
    try {
      const currentSettings = await this.dataManager.getUserPreferences();
      const updatedSettings = { ...currentSettings, ...settings };
      
      await this.dataManager.saveUserPreferences(updatedSettings);
      
      // If data collection was disabled, end current session
      if (!updatedSettings.dataCollectionEnabled && this.currentSessionId) {
        await this.endSession();
      }
      
      console.log('Updated data collection settings');
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  /**
   * Private Methods
   */

  async recordEvent(event) {
    await this.dataManager.storeEvent(event);
    this.sessionEvents.push(event);
  }

  isEnabled() {
    return this.isInitialized && this.currentSessionId;
  }

  calculateSessionQuality() {
    const metrics = this.sessionMetrics;
    const duration = Date.now() - this.sessionStartTime;
    
    // Simple quality scoring algorithm
    let score = 0;
    
    // Duration scoring (sweet spot around 2-10 minutes)
    const durationMinutes = duration / (1000 * 60);
    if (durationMinutes >= 2 && durationMinutes <= 10) {
      score += 30;
    } else if (durationMinutes > 10) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Interaction scoring
    score += Math.min(metrics.interactionCount * 5, 30);
    
    // Diversity scoring
    score += Math.min(metrics.ingredientsViewed.size * 2, 20);
    
    // Feedback scoring (indicates engagement)
    score += metrics.feedbackCount * 10;
    
    // Correction scoring (indicates learning)
    score += metrics.correctionCount * 5;
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  calculateAnalytics(events) {
    // Implement analytics calculation
    return {
      totalEvents: events.length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {}),
      dateRange: {
        start: Math.min(...events.map(e => e.timestamp)),
        end: Math.max(...events.map(e => e.timestamp))
      },
      uniqueIngredients: new Set(
        events
          .filter(e => e.data.ingredientId || e.data.ingredientName)
          .map(e => e.data.ingredientId || e.data.ingredientName)
      ).size,
      searchPatterns: this.analyzeSearchPatterns(events),
      correctionPatterns: this.analyzeCorrectionPatterns(events)
    };
  }

  analyzeSearchPatterns(events) {
    const searchEvents = events.filter(e => e.eventType === EVENT_TYPES.INGREDIENT_SEARCH);
    return {
      totalSearches: searchEvents.length,
      averageQueryLength: searchEvents.reduce((sum, e) => sum + (e.data.queryLength || 0), 0) / searchEvents.length,
      commonQueries: this.getTopQueries(searchEvents),
      searchSuccessRate: this.calculateSearchSuccessRate(searchEvents)
    };
  }

  analyzeCorrectionPatterns(events) {
    const correctionEvents = events.filter(e => e.eventType === EVENT_TYPES.INGREDIENT_CORRECTION);
    return {
      totalCorrections: correctionEvents.length,
      correctionsByType: correctionEvents.reduce((acc, e) => {
        const type = e.data.correctionType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      averageEditDistance: correctionEvents.reduce((sum, e) => sum + (e.data.editDistance || 0), 0) / correctionEvents.length
    };
  }

  getTopQueries(searchEvents) {
    const queryCount = {};
    searchEvents.forEach(e => {
      const query = e.data.query?.toLowerCase();
      if (query) {
        queryCount[query] = (queryCount[query] || 0) + 1;
      }
    });
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  }

  calculateSearchSuccessRate(searchEvents) {
    const successfulSearches = searchEvents.filter(e => e.data.hasResults).length;
    return searchEvents.length > 0 ? successfulSearches / searchEvents.length : 0;
  }
}

// Singleton instance
let collectorInstance = null;

export const getIngredientDataCollector = () => {
  if (!collectorInstance) {
    collectorInstance = new IngredientDataCollector();
  }
  return collectorInstance;
};

export default IngredientDataCollector;