/**
 * IngredientService - Abstraction layer for ingredient data management
 * 
 * This service provides a consistent interface for ingredient operations
 * regardless of the underlying data source (embedded database, server API, etc.)
 * 
 * Architecture supports:
 * - Future migration to server-side database
 * - Multiple language support
 * - Offline-first functionality
 * - Performance optimization
 * - Vector-enhanced ingredient similarity and search
 */

import VectorService from './VectorService.js';

class IngredientService {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.vectorService = VectorService;
    this.vectorFeaturesEnabled = false; // Feature flag for vector operations
    this.performanceMetrics = new Map(); // Track performance comparisons
  }

  /**
   * Initialize the service with vector capabilities
   */
  async initialize() {
    try {
      const vectorInitialized = await this.vectorService.initialize();
      if (vectorInitialized) {
        this.vectorFeaturesEnabled = true;
        console.log('IngredientService: Vector features enabled');
      } else {
        console.log('IngredientService: Running without vector features');
      }
    } catch (error) {
      console.warn('IngredientService: Vector initialization failed, using fallback', error);
    }
  }

  /**
   * Enable or disable vector features (for A/B testing)
   */
  setVectorFeaturesEnabled(enabled) {
    this.vectorFeaturesEnabled = enabled;
    console.log(`Vector features ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Search for ingredients by name
   * @param {string} query - Search term
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of matching ingredients
   */
  async searchIngredients(query, limit = 20) {
    return this.dataSource.searchIngredients(query, limit);
  }

  /**
   * Get ingredient by ID
   * @param {string} id - Ingredient ID
   * @returns {Promise<Object|null>} Ingredient object or null if not found
   */
  async getIngredientById(id) {
    return this.dataSource.getIngredientById(id);
  }

  /**
   * Get all available units for a specific ingredient
   * @param {string} ingredientId - Ingredient ID
   * @returns {Promise<Array>} Array of applicable units
   */
  async getUnitsForIngredient(ingredientId) {
    return this.dataSource.getUnitsForIngredient(ingredientId);
  }

  /**
   * Get all preparation methods for a specific ingredient
   * @param {string} ingredientId - Ingredient ID
   * @returns {Promise<Array>} Array of applicable preparation methods
   */
  async getPreparationMethodsForIngredient(ingredientId) {
    return this.dataSource.getPreparationMethodsForIngredient(ingredientId);
  }

  /**
   * Parse a free-form ingredient string into structured components
   * @param {string} ingredientText - Raw ingredient text (e.g., "2 cups onions, chopped")
   * @returns {Promise<Object>} Structured ingredient object
   */
  async parseIngredientText(ingredientText) {
    return this.dataSource.parseIngredientText(ingredientText);
  }

  /**
   * Format a structured ingredient into display text
   * @param {Object} ingredient - Structured ingredient object
   * @returns {string} Formatted ingredient text
   */
  formatIngredientForDisplay(ingredient) {
    return this.dataSource.formatIngredientForDisplay(ingredient);
  }

  /**
   * Suggest unit conversions for a given quantity and unit
   * @param {number} quantity - Amount
   * @param {string} unitId - Current unit ID
   * @returns {Promise<Array>} Array of conversion suggestions
   */
  async suggestUnitConversions(quantity, unitId) {
    return this.dataSource.suggestUnitConversions(quantity, unitId);
  }

  /**
   * Get categories for ingredient organization
   * @returns {Promise<Array>} Array of ingredient categories
   */
  async getCategories() {
    return this.dataSource.getCategories();
  }

  /**
   * Get ingredients by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of ingredients in category
   */
  async getIngredientsByCategory(categoryId) {
    return this.dataSource.getIngredientsByCategory(categoryId);
  }

  /**
   * Add a custom ingredient (for user-specific additions)
   * @param {Object} ingredient - Ingredient data
   * @returns {Promise<Object>} Created ingredient with ID
   */
  async addCustomIngredient(ingredient) {
    return this.dataSource.addCustomIngredient(ingredient);
  }

  /**
   * Find similar ingredients using vector similarity
   * @param {string} ingredientName - Name of ingredient to find similarities for
   * @param {number} threshold - Minimum similarity threshold (0-1)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of similar ingredients with similarity scores
   */
  async findSimilarIngredients(ingredientName, threshold = 0.5, limit = 10) {
    try {
      if (!this.vectorFeaturesEnabled) {
        console.log('Vector features disabled, using fallback similarity');
        return this.fallbackSimilaritySearch(ingredientName, threshold, limit);
      }

      // Get all ingredients for comparison
      const allIngredients = await this.getAllIngredients();
      
      // Use vector service for similarity search
      const startTime = Date.now();
      const similarIngredients = await this.vectorService.findSimilarIngredients(
        ingredientName, 
        allIngredients, 
        threshold, 
        limit
      );
      
      // Record performance metrics
      const duration = Date.now() - startTime;
      this.recordPerformanceMetric('findSimilarIngredients', duration);
      
      return similarIngredients.map(result => ({
        ...result.ingredient,
        similarityScore: result.similarity,
        matchType: 'vector'
      }));

    } catch (error) {
      console.error('Error in vector similarity search:', error);
      return this.fallbackSimilaritySearch(ingredientName, threshold, limit);
    }
  }

  /**
   * Enhanced search with vector-powered auto-complete
   * @param {string} query - Search term (can include typos)
   * @param {number} limit - Maximum results to return
   * @param {boolean} useVector - Whether to use vector search
   * @returns {Promise<Array>} Array of matching ingredients
   */
  async smartSearchIngredients(query, limit = 20, useVector = null) {
    const shouldUseVector = useVector !== null ? useVector : this.vectorFeaturesEnabled;
    
    try {
      // Always run traditional search first
      const traditionalResults = await this.searchIngredients(query, limit);
      
      if (!shouldUseVector || traditionalResults.length >= limit) {
        return traditionalResults.map(ing => ({ ...ing, matchType: 'traditional' }));
      }

      // Enhance with vector similarity for better typo tolerance
      const vectorResults = await this.findSimilarIngredients(query, 0.3, limit);
      
      // Combine and deduplicate results
      const combinedResults = this.combineSearchResults(traditionalResults, vectorResults, limit);
      
      return combinedResults;

    } catch (error) {
      console.error('Error in smart search:', error);
      // Fallback to traditional search
      return this.searchIngredients(query, limit);
    }
  }

  /**
   * Shadow mode: Run both traditional and vector parsing, compare results
   * @param {string} ingredientText - Raw ingredient text
   * @returns {Promise<Object>} Structured ingredient with comparison metrics
   */
  async parseIngredientTextWithComparison(ingredientText) {
    const startTime = Date.now();
    
    // Run traditional parsing
    const traditionalResult = await this.parseIngredientText(ingredientText);
    const traditionalTime = Date.now() - startTime;
    
    if (!this.vectorFeaturesEnabled) {
      return {
        ...traditionalResult,
        parseMethod: 'traditional',
        parseTime: traditionalTime
      };
    }

    try {
      // Run vector-enhanced parsing in parallel (for Phase 1 comparison)
      const vectorStartTime = Date.now();
      const vectorEnhancedResult = await this.enhanceParsingWithVectors(traditionalResult, ingredientText);
      const vectorTime = Date.now() - vectorStartTime;

      // Record comparison metrics
      this.recordComparisonMetric('parsing', {
        traditional: { result: traditionalResult, time: traditionalTime },
        vector: { result: vectorEnhancedResult, time: vectorTime }
      });

      return {
        ...vectorEnhancedResult,
        parseMethod: 'hybrid',
        parseTime: traditionalTime + vectorTime,
        traditionalResult: traditionalResult // For comparison
      };

    } catch (error) {
      console.error('Vector parsing enhancement failed:', error);
      return {
        ...traditionalResult,
        parseMethod: 'traditional-fallback',
        parseTime: traditionalTime
      };
    }
  }

  /**
   * Enhance traditional parsing results with vector similarity
   * @param {Object} traditionalResult - Result from traditional parsing
   * @param {string} originalText - Original ingredient text
   * @returns {Promise<Object>} Enhanced parsing result
   */
  async enhanceParsingWithVectors(traditionalResult, originalText) {
    if (!traditionalResult.ingredient || traditionalResult.isStructured) {
      return traditionalResult; // Already well-structured
    }

    try {
      // Try to find similar known ingredients for unrecognized ones
      const ingredientName = traditionalResult.ingredient.name || originalText;
      const similarIngredients = await this.findSimilarIngredients(ingredientName, 0.7, 3);

      if (similarIngredients.length > 0) {
        const bestMatch = similarIngredients[0];
        
        return {
          ...traditionalResult,
          ingredient: {
            ...traditionalResult.ingredient,
            id: bestMatch.id,
            name: bestMatch.name,
            category: bestMatch.category,
            vectorSuggestion: true,
            confidence: bestMatch.similarityScore
          },
          isStructured: true,
          enhancedByVector: true
        };
      }

      return traditionalResult;

    } catch (error) {
      console.warn('Vector enhancement failed:', error);
      return traditionalResult;
    }
  }

  /**
   * Get all ingredients (for vector similarity operations)
   * @returns {Promise<Array>} All available ingredients
   */
  async getAllIngredients() {
    // TODO: Implement based on your data source
    // For now, return a placeholder
    return this.dataSource.getAllIngredients ? await this.dataSource.getAllIngredients() : [];
  }

  /**
   * Fallback similarity search using text-based methods
   */
  async fallbackSimilaritySearch(ingredientName, threshold, limit) {
    try {
      const allIngredients = await this.getAllIngredients();
      return this.vectorService.fallbackTextSimilarity(ingredientName, allIngredients, threshold, limit);
    } catch (error) {
      console.error('Fallback similarity search failed:', error);
      return [];
    }
  }

  /**
   * Combine traditional and vector search results, removing duplicates
   */
  combineSearchResults(traditionalResults, vectorResults, limit) {
    const seen = new Set();
    const combined = [];

    // Add traditional results first (exact matches)
    for (const result of traditionalResults) {
      const key = result.id || result.name;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ ...result, matchType: 'traditional' });
      }
    }

    // Add vector results that aren't duplicates
    for (const result of vectorResults) {
      const key = result.id || result.name;
      if (!seen.has(key) && combined.length < limit) {
        seen.add(key);
        combined.push({ ...result, matchType: 'vector' });
      }
    }

    return combined.slice(0, limit);
  }

  /**
   * Record performance metrics for analysis
   */
  recordPerformanceMetric(operation, duration) {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    this.performanceMetrics.get(operation).push({
      duration,
      timestamp: Date.now()
    });
  }

  /**
   * Record comparison metrics between traditional and vector approaches
   */
  recordComparisonMetric(operation, comparison) {
    const key = `${operation}_comparison`;
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    this.performanceMetrics.get(key).push({
      ...comparison,
      timestamp: Date.now()
    });
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics() {
    const analytics = {};
    
    for (const [operation, metrics] of this.performanceMetrics) {
      const durations = metrics.map(m => m.duration || m.traditional?.time || 0);
      analytics[operation] = {
        count: metrics.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        recentMetrics: metrics.slice(-10) // Last 10 operations
      };
    }
    
    return {
      vectorEnabled: this.vectorFeaturesEnabled,
      vectorStatus: this.vectorService.getStatus(),
      operations: analytics
    };
  }
}

export default IngredientService;