/**
 * VectorService
 * 
 * Handles vector embeddings and similarity search for ingredients
 * Uses Sentence Transformers (all-MiniLM-L6-v2) model for on-device processing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class VectorService {
  constructor() {
    this.isInitialized = false;
    this.embeddingCache = new Map();
    this.model = null;
    this.embeddingDim = 384; // all-MiniLM-L6-v2 output dimension
  }

  /**
   * Initialize the vector service
   * For now, we'll simulate the model until we integrate the actual Sentence Transformers
   */
  async initialize() {
    try {
      // TODO: Load actual Sentence Transformers model
      // For Phase 1, we'll simulate embeddings for development
      console.log('Initializing VectorService...');
      
      // Load cached embeddings from storage
      await this.loadEmbeddingCache();
      
      this.isInitialized = true;
      console.log('VectorService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize VectorService:', error);
      return false;
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

    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }

    // TODO: Replace with actual Sentence Transformers inference
    // For now, generate a simple hash-based pseudo-embedding for development
    const embedding = this.generatePseudoEmbedding(text);
    
    // Cache the result
    this.embeddingCache.set(cacheKey, embedding);
    
    return embedding;
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
              similarity: similarity
            });
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

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
   * Get service status and metrics
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      cacheSize: this.embeddingCache.size,
      embeddingDimension: this.embeddingDim,
      modelType: 'pseudo-embedding (development)'
    };
  }
}

export default new VectorService();