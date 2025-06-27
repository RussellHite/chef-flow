/**
 * VectorService
 * 
 * Handles vector embeddings and similarity search for ingredients
 * Uses Sentence Transformers (all-MiniLM-L6-v2) model for on-device processing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import { InferenceSession, Tensor } from 'onnxruntime-react-native'; // Temporarily disabled for Expo Go compatibility
// import SimpleTokenizer from './SimpleTokenizer'; // Temporarily disabled for Expo Go compatibility
import VectorDatabase from './VectorDatabase';
import VectorConfig from './VectorConfig';

class VectorService {
  constructor() {
    this.isInitialized = false;
    this.embeddingCache = new Map();
    this.session = null;
    this.tokenizer = null;
    this.embeddingDim = 384; // all-MiniLM-L6-v2 output dimension
    this.maxSequenceLength = 256; // Will be set from config
    this.useRealEmbeddings = true; // Will be set from config
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.performanceMetrics = new Map();
  }

  /**
   * Initialize the vector service with real ONNX model
   */
  async initialize() {
    try {
      console.log('Initializing VectorService with configuration...');
      
      // Initialize configuration
      await VectorConfig.initialize();
      
      // Apply configuration settings
      this.applyConfiguration();
      
      if (this.useRealEmbeddings) {
        // Real embeddings are temporarily disabled for Expo Go compatibility
        console.log('Real embeddings disabled for Expo Go compatibility - using pseudo-embeddings');
        this.useRealEmbeddings = false;
      }
      
      // Initialize vector database if enabled
      if (VectorConfig.isVectorDatabaseEnabled()) {
        await VectorDatabase.initialize();
        console.log('Vector database initialized');
      }
      
      // Load cached embeddings from storage
      await this.loadEmbeddingCache();
      
      // Start cache cleanup timer
      this.startCacheCleanup();
      
      this.isInitialized = true;
      console.log('VectorService initialized successfully (pseudo-embedding mode for Expo Go)');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize VectorService:', error);
      // Fallback to pseudo-embeddings if real embeddings fail
      this.useRealEmbeddings = false;
      await this.loadEmbeddingCache();
      this.isInitialized = true;
      console.log('VectorService initialized in fallback mode after error');
      return true;
    }
  }

  /**
   * Apply configuration settings
   */
  applyConfiguration() {
    const performanceConfig = VectorConfig.getPerformanceConfig();
    
    this.maxSequenceLength = performanceConfig.maxSequenceLength;
    this.useRealEmbeddings = VectorConfig.isRealEmbeddingsEnabled();
    
    // Resize cache if needed
    if (this.embeddingCache.size > performanceConfig.embeddingCacheSize) {
      this.trimCache(performanceConfig.embeddingCacheSize);
    }
    
    console.log('Vector configuration applied:', {
      maxSequenceLength: this.maxSequenceLength,
      useRealEmbeddings: this.useRealEmbeddings,
      cacheSize: performanceConfig.embeddingCacheSize
    });
  }

  /**
   * Start cache cleanup timer
   */
  startCacheCleanup() {
    const config = VectorConfig.getPerformanceConfig();
    
    setInterval(() => {
      this.cleanupCache();
    }, config.embeddingGCInterval);
  }

  /**
   * Cleanup cache based on memory limits
   */
  cleanupCache() {
    const config = VectorConfig.getPerformanceConfig();
    const maxCacheSize = config.embeddingCacheSize;
    
    if (this.embeddingCache.size > maxCacheSize) {
      this.trimCache(maxCacheSize * 0.8); // Trim to 80% of max
      console.log(`Cache cleaned up: ${this.embeddingCache.size} items remaining`);
    }
  }

  /**
   * Trim cache to specified size (LRU eviction)
   */
  trimCache(targetSize) {
    if (this.embeddingCache.size <= targetSize) return;
    
    const entries = Array.from(this.embeddingCache.entries());
    const toRemove = this.embeddingCache.size - targetSize;
    
    // Remove oldest entries (simple LRU approximation)
    for (let i = 0; i < toRemove; i++) {
      this.embeddingCache.delete(entries[i][0]);
    }
  }

  /**
   * Generate embedding for a given text
   * @param {string} text - Text to embed
   * @returns {Promise<Array>} - Embedding vector
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input text for embedding generation');
    }

    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (this.embeddingCache.has(cacheKey)) {
      this.cacheHits++;
      this.recordPerformance('cache_hit', Date.now() - startTime);
      return this.embeddingCache.get(cacheKey);
    }

    this.cacheMisses++;
    let embedding;
    let embeddingMethod = 'pseudo';
    
    if (this.useRealEmbeddings && this.tokenizer && this.session) {
      try {
        // Use real ONNX model for embeddings
        embedding = await this.generateRealEmbedding(text);
        embeddingMethod = 'real';
      } catch (error) {
        console.warn('Real embedding failed, falling back to pseudo-embedding:', error);
        embedding = this.generatePseudoEmbedding(text);
        embeddingMethod = 'pseudo_fallback';
      }
    } else {
      // Fallback to pseudo-embeddings
      embedding = this.generatePseudoEmbedding(text);
    }
    
    // Cache the result (with size limit)
    const config = VectorConfig.getPerformanceConfig();
    if (this.embeddingCache.size < config.embeddingCacheSize) {
      this.embeddingCache.set(cacheKey, embedding);
    }
    
    const duration = Date.now() - startTime;
    this.recordPerformance(`embedding_${embeddingMethod}`, duration);
    
    if (VectorConfig.isDebugMode()) {
      console.log(`Generated ${embeddingMethod} embedding for "${text.substring(0, 20)}..." in ${duration}ms`);
    }
    
    return embedding;
  }

  /**
   * Record performance metrics
   */
  recordPerformance(operation, duration) {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(operation);
    metrics.count++;
    metrics.totalTime += duration;
    metrics.avgTime = metrics.totalTime / metrics.count;
    metrics.minTime = Math.min(metrics.minTime, duration);
    metrics.maxTime = Math.max(metrics.maxTime, duration);
  }

  /**
   * Generate real embedding using ONNX model
   * @param {string} text - Input text
   * @returns {Promise<Array>} - 384-dimensional embedding vector
   */
  async generateRealEmbedding(text) {
    // Real embeddings are temporarily disabled for Expo Go compatibility
    console.warn('Real embedding generation not available in Expo Go mode - falling back to pseudo-embedding');
    return this.generatePseudoEmbedding(text);
  }

  /**
   * Mean pooling with attention mask
   */
  meanPooling(embeddings, attentionMask) {
    const seqLength = attentionMask.length;
    const embeddingDim = this.embeddingDim;
    const pooled = new Array(embeddingDim).fill(0);
    let validTokens = 0;
    
    for (let i = 0; i < seqLength; i++) {
      if (attentionMask[i] === 1) {
        validTokens++;
        for (let j = 0; j < embeddingDim; j++) {
          pooled[j] += embeddings[i * embeddingDim + j];
        }
      }
    }
    
    // Average over valid tokens
    if (validTokens > 0) {
      for (let j = 0; j < embeddingDim; j++) {
        pooled[j] /= validTokens;
      }
    }
    
    return pooled;
  }

  /**
   * Normalize vector to unit length
   */
  normalizeVector(vector) {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vector.map(val => val / norm) : vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vectorA - First vector
   * @param {Array} vectorB - Second vector
   * @returns {number} - Similarity score (0-1)
   */
  cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm === 0 ? 0 : dotProduct / norm;
  }

  /**
   * Find similar ingredients based on vector similarity
   * @param {string} ingredientName - Name of ingredient to find similarities for
   * @param {Array} ingredientsList - List of ingredients to search
   * @param {number} threshold - Minimum similarity threshold (0-1)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Array of similar ingredients with similarity scores
   */
  async findSimilarIngredients(ingredientName, ingredientsList = [], threshold = 0.5, limit = 10) {
    try {
      if (!this.isInitialized) {
        console.warn('VectorService not initialized, falling back to text similarity');
        return this.fallbackTextSimilarity(ingredientName, ingredientsList, threshold, limit);
      }

      // Generate embedding for target ingredient
      const targetEmbedding = await this.generateEmbedding(ingredientName);

      if (this.useRealEmbeddings && VectorDatabase.isInitialized) {
        // Use vector database for similarity search
        console.log('Using vector database for similarity search');
        const dbResults = await VectorDatabase.findSimilarIngredients(targetEmbedding, threshold, limit);
        
        // Map database results to ingredient format
        return dbResults.map(result => ({
          ingredient: { name: result.ingredientName, id: result.ingredientId },
          name: result.ingredientName,
          similarity: result.similarity,
          source: 'vector_db'
        }));
      } else {
        // Fallback to in-memory similarity calculation
        console.log('Using in-memory similarity calculation');
        const similarities = [];

        // Calculate similarities with all ingredients
        for (const ingredient of ingredientsList) {
          const name = ingredient.structured?.ingredient?.name || 
                      ingredient.displayText || 
                      ingredient.originalText || 
                      ingredient;

          if (typeof name === 'string' && name.toLowerCase() !== ingredientName.toLowerCase()) {
            const embedding = await this.generateEmbedding(name);
            const similarity = this.cosineSimilarity(targetEmbedding, embedding);

            if (similarity >= threshold) {
              similarities.push({
                ingredient: ingredient,
                name: name,
                similarity: similarity,
                source: 'in_memory'
              });
            }
          }
        }

        // Sort by similarity (highest first) and limit results
        return similarities
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
      }

    } catch (error) {
      console.error('Error in findSimilarIngredients:', error);
      // Fallback to text-based similarity
      return this.fallbackTextSimilarity(ingredientName, ingredientsList, threshold, limit);
    }
  }

  /**
   * Fallback text-based similarity for when vectors aren't available
   */
  fallbackTextSimilarity(ingredientName, ingredientsList, threshold, limit) {
    const similarities = [];
    const targetWords = ingredientName.toLowerCase().split(/\s+/);

    for (const ingredient of ingredientsList) {
      const name = ingredient.structured?.ingredient?.name || 
                  ingredient.displayText || 
                  ingredient.originalText || 
                  ingredient;

      if (typeof name === 'string' && name.toLowerCase() !== ingredientName.toLowerCase()) {
        const nameWords = name.toLowerCase().split(/\s+/);
        
        // Simple word overlap similarity
        const commonWords = targetWords.filter(word => 
          nameWords.some(nameWord => 
            nameWord.includes(word) || word.includes(nameWord)
          )
        );
        
        const similarity = commonWords.length / Math.max(targetWords.length, nameWords.length);

        if (similarity >= threshold) {
          similarities.push({
            ingredient: ingredient,
            name: name,
            similarity: similarity
          });
        }
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Generate pseudo-embedding for development
   * TODO: Replace with actual Sentence Transformers
   */
  generatePseudoEmbedding(text) {
    const normalized = text.toLowerCase().trim();
    const embedding = new Array(this.embeddingDim).fill(0);
    
    // Create a deterministic but varied embedding based on text content
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = (charCode + i) % this.embeddingDim;
      embedding[index] += Math.sin(charCode * (i + 1)) * 0.1;
    }
    
    // Normalize the vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? embedding.map(val => val / norm) : embedding;
  }

  /**
   * Load cached embeddings from storage
   */
  async loadEmbeddingCache() {
    try {
      const cached = await AsyncStorage.getItem('vectorEmbeddingCache');
      if (cached) {
        const data = JSON.parse(cached);
        this.embeddingCache = new Map(data);
        console.log(`Loaded ${this.embeddingCache.size} cached embeddings`);
      }
    } catch (error) {
      console.warn('Failed to load embedding cache:', error);
    }
  }

  /**
   * Save embeddings to cache
   */
  async saveEmbeddingCache() {
    try {
      const data = Array.from(this.embeddingCache.entries());
      await AsyncStorage.setItem('vectorEmbeddingCache', JSON.stringify(data));
      console.log(`Saved ${data.length} embeddings to cache`);
    } catch (error) {
      console.warn('Failed to save embedding cache:', error);
    }
  }

  /**
   * Performance monitoring
   */
  async measurePerformance(operation, ...args) {
    const start = Date.now();
    const result = await operation(...args);
    const duration = Date.now() - start;
    
    console.log(`Vector operation took ${duration}ms`);
    
    // TODO: Store performance metrics for analysis
    return { result, duration };
  }

  /**
   * Load ONNX model from assets
   */
  async loadOnnxModel() {
    try {
      // For now, we'll create a placeholder until we have the actual model file
      // TODO: Load the actual all-MiniLM-L6-v2 ONNX model
      console.log('ONNX model loading would happen here - placeholder for now');
      
      // In a real implementation, this would be:
      // const modelPath = require('../assets/models/all-MiniLM-L6-v2.onnx');
      // this.session = await InferenceSession.create(modelPath);
      
      return false; // Return false for now since we don't have the actual model
    } catch (error) {
      console.error('Failed to load ONNX model:', error);
      return false;
    }
  }

  /**
   * Store embedding in vector database
   */
  async storeIngredientEmbedding(ingredientId, ingredientName, embedding) {
    if (this.useRealEmbeddings && VectorDatabase.isInitialized) {
      return await VectorDatabase.storeEmbedding(ingredientId, ingredientName, embedding);
    }
    return false;
  }

  /**
   * Get embedding from vector database
   */
  async getStoredEmbedding(ingredientId) {
    if (this.useRealEmbeddings && VectorDatabase.isInitialized) {
      return await VectorDatabase.getEmbedding(ingredientId);
    }
    return null;
  }

  /**
   * Batch process ingredients for embedding generation and storage
   */
  async batchProcessIngredients(ingredients) {
    if (!this.useRealEmbeddings || !VectorDatabase.isInitialized) {
      console.log('Vector database not available for batch processing');
      return false;
    }

    console.log(`Starting batch processing of ${ingredients.length} ingredients...`);
    const embeddings = [];
    let processed = 0;

    for (const ingredient of ingredients) {
      try {
        const embedding = await this.generateEmbedding(ingredient.name);
        embeddings.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          embedding: embedding
        });
        processed++;

        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${ingredients.length} ingredients...`);
        }
      } catch (error) {
        console.error(`Failed to generate embedding for ${ingredient.name}:`, error);
      }
    }

    // Batch store all embeddings
    const success = await VectorDatabase.batchStoreEmbeddings(embeddings);
    console.log(`Batch processing complete: ${processed} ingredients processed, storage ${success ? 'successful' : 'failed'}`);
    
    return success;
  }

  /**
   * Get vector database statistics
   */
  async getDatabaseStats() {
    if (VectorDatabase.isInitialized) {
      return await VectorDatabase.getStats();
    }
    return { error: 'Vector database not initialized' };
  }

  /**
   * Enable or disable real embeddings
   */
  setUseRealEmbeddings(enabled) {
    this.useRealEmbeddings = enabled;
    console.log(`Vector embeddings ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get service status and metrics
   */
  getStatus() {
    const config = VectorConfig.getAll();
    
    return {
      initialized: this.isInitialized,
      configuration: {
        vectorFeaturesEnabled: config.vectorFeaturesEnabled,
        realEmbeddingsEnabled: config.realEmbeddingsEnabled,
        vectorDatabaseEnabled: config.vectorDatabaseEnabled,
        debugMode: config.debugMode
      },
      cache: {
        size: this.embeddingCache.size,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: this.cacheHits + this.cacheMisses > 0 ? (this.cacheHits / (this.cacheHits + this.cacheMisses)) : 0
      },
      model: {
        type: this.useRealEmbeddings && this.session ? 'all-MiniLM-L6-v2 (ONNX)' : 'pseudo-embedding (fallback)',
        embeddingDimension: this.embeddingDim,
        maxSequenceLength: this.maxSequenceLength,
        hasOnnxSession: !!this.session,
        hasTokenizer: !!this.tokenizer
      },
      performance: this.getPerformanceMetrics(),
      database: {
        enabled: VectorConfig.isVectorDatabaseEnabled(),
        initialized: VectorDatabase.isInitialized
      }
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics = {};
    
    for (const [operation, data] of this.performanceMetrics.entries()) {
      metrics[operation] = {
        count: data.count,
        avgTime: Math.round(data.avgTime * 100) / 100,
        minTime: data.minTime === Infinity ? 0 : data.minTime,
        maxTime: data.maxTime,
        totalTime: data.totalTime
      };
    }
    
    return metrics;
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics() {
    this.performanceMetrics.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('Performance metrics cleared');
  }

  /**
   * Get configuration instance
   */
  getConfig() {
    return VectorConfig;
  }
}

export default new VectorService();