/**
 * Vector Database Service
 * 
 * Handles SQLite storage and retrieval of vector embeddings
 * Uses op-sqlite for high-performance vector operations
 */

import { open } from '@op-engineering/op-sqlite';

class VectorDatabase {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.dbPath = 'chef_flow_vectors.db';
  }

  /**
   * Initialize the vector database
   */
  async initialize() {
    try {
      console.log('Initializing Vector Database...');
      
      // Open SQLite database
      this.db = open({
        name: this.dbPath,
        location: 'default', // Use default location
      });
      
      // Create vector tables
      await this.createTables();
      
      // Create indexes for performance
      await this.createIndexes();
      
      this.isInitialized = true;
      console.log('Vector Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Vector Database:', error);
      return false;
    }
  }

  /**
   * Create database tables for vector storage
   */
  async createTables() {
    // Ingredient embeddings table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ingredient_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id TEXT UNIQUE NOT NULL,
        ingredient_name TEXT NOT NULL,
        embedding BLOB NOT NULL,
        embedding_dimension INTEGER NOT NULL,
        model_version TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vector metadata table for performance tracking
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS vector_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        total_vectors INTEGER DEFAULT 0,
        embedding_dimension INTEGER NOT NULL,
        model_version TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Search performance table for analytics
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS search_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_text TEXT NOT NULL,
        result_count INTEGER NOT NULL,
        search_duration_ms INTEGER NOT NULL,
        similarity_threshold REAL NOT NULL,
        search_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Vector database tables created successfully');
  }

  /**
   * Create indexes for performance optimization
   */
  async createIndexes() {
    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_ingredient_embeddings_ingredient_id 
      ON ingredient_embeddings(ingredient_id)
    `);

    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_ingredient_embeddings_name 
      ON ingredient_embeddings(ingredient_name)
    `);

    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_ingredient_embeddings_model 
      ON ingredient_embeddings(model_version)
    `);

    console.log('Vector database indexes created successfully');
  }

  /**
   * Store vector embedding for an ingredient
   */
  async storeEmbedding(ingredientId, ingredientName, embedding, modelVersion = 'all-MiniLM-L6-v2') {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized');
    }

    try {
      // Convert embedding array to blob
      const embeddingBlob = this.arrayToBlob(embedding);
      
      // Insert or update embedding
      await this.db.execute(`
        INSERT OR REPLACE INTO ingredient_embeddings 
        (ingredient_id, ingredient_name, embedding, embedding_dimension, model_version, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [ingredientId, ingredientName, embeddingBlob, embedding.length, modelVersion]);

      // Update metadata
      await this.updateMetadata('ingredient_embeddings', embedding.length, modelVersion);

      return true;
    } catch (error) {
      console.error('Failed to store embedding:', error);
      return false;
    }
  }

  /**
   * Retrieve vector embedding for an ingredient
   */
  async getEmbedding(ingredientId) {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized');
    }

    try {
      const result = await this.db.execute(`
        SELECT embedding, embedding_dimension, model_version 
        FROM ingredient_embeddings 
        WHERE ingredient_id = ?
      `, [ingredientId]);

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        const embedding = this.blobToArray(row.embedding, row.embedding_dimension);
        return {
          embedding,
          modelVersion: row.model_version,
          dimension: row.embedding_dimension
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get embedding:', error);
      return null;
    }
  }

  /**
   * Find similar ingredients using vector similarity
   */
  async findSimilarIngredients(queryEmbedding, threshold = 0.5, limit = 10) {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized');
    }

    const startTime = Date.now();

    try {
      // Get all embeddings (in a real implementation, this would use vector indexing)
      const result = await this.db.execute(`
        SELECT ingredient_id, ingredient_name, embedding, embedding_dimension 
        FROM ingredient_embeddings
      `);

      const similarities = [];

      if (result.rows) {
        for (const row of result.rows) {
          const embedding = this.blobToArray(row.embedding, row.embedding_dimension);
          const similarity = this.cosineSimilarity(queryEmbedding, embedding);
          
          if (similarity >= threshold) {
            similarities.push({
              ingredientId: row.ingredient_id,
              ingredientName: row.ingredient_name,
              similarity: similarity
            });
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      const sortedResults = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      const duration = Date.now() - startTime;

      // Log performance for analytics
      await this.logSearchPerformance('vector_similarity', sortedResults.length, duration, threshold);

      return sortedResults;
    } catch (error) {
      console.error('Failed to find similar ingredients:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
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
   * Get all stored embeddings count and statistics
   */
  async getStats() {
    if (!this.isInitialized) {
      return { error: 'Database not initialized' };
    }

    try {
      const countResult = await this.db.execute(`
        SELECT COUNT(*) as total_embeddings,
               AVG(embedding_dimension) as avg_dimension,
               model_version
        FROM ingredient_embeddings
        GROUP BY model_version
      `);

      const performanceResult = await this.db.execute(`
        SELECT AVG(search_duration_ms) as avg_search_time,
               COUNT(*) as total_searches
        FROM search_performance
        WHERE created_at > datetime('now', '-24 hours')
      `);

      return {
        totalEmbeddings: countResult.rows?.[0]?.total_embeddings || 0,
        avgDimension: countResult.rows?.[0]?.avg_dimension || 0,
        modelVersion: countResult.rows?.[0]?.model_version || 'unknown',
        avgSearchTime: performanceResult.rows?.[0]?.avg_search_time || 0,
        totalSearches24h: performanceResult.rows?.[0]?.total_searches || 0
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Batch store multiple embeddings for performance
   */
  async batchStoreEmbeddings(embeddings, modelVersion = 'all-MiniLM-L6-v2') {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized');
    }

    try {
      await this.db.transaction(async () => {
        for (const { ingredientId, ingredientName, embedding } of embeddings) {
          const embeddingBlob = this.arrayToBlob(embedding);
          
          await this.db.execute(`
            INSERT OR REPLACE INTO ingredient_embeddings 
            (ingredient_id, ingredient_name, embedding, embedding_dimension, model_version, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `, [ingredientId, ingredientName, embeddingBlob, embedding.length, modelVersion]);
        }
      });

      console.log(`Batch stored ${embeddings.length} embeddings successfully`);
      return true;
    } catch (error) {
      console.error('Failed to batch store embeddings:', error);
      return false;
    }
  }

  /**
   * Convert array to blob for SQLite storage
   */
  arrayToBlob(array) {
    const buffer = new ArrayBuffer(array.length * 4); // 4 bytes per float32
    const view = new Float32Array(buffer);
    for (let i = 0; i < array.length; i++) {
      view[i] = array[i];
    }
    return new Uint8Array(buffer);
  }

  /**
   * Convert blob back to array
   */
  blobToArray(blob, length) {
    const buffer = blob.buffer || blob;
    const view = new Float32Array(buffer);
    return Array.from(view).slice(0, length);
  }

  /**
   * Update metadata table
   */
  async updateMetadata(tableName, embeddingDimension, modelVersion) {
    const count = await this.db.execute(`
      SELECT COUNT(*) as count FROM ${tableName}
    `);

    await this.db.execute(`
      INSERT OR REPLACE INTO vector_metadata 
      (table_name, total_vectors, embedding_dimension, model_version, last_updated)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [tableName, count.rows[0].count, embeddingDimension, modelVersion]);
  }

  /**
   * Log search performance for analytics
   */
  async logSearchPerformance(searchType, resultCount, durationMs, threshold, queryText = '') {
    try {
      await this.db.execute(`
        INSERT INTO search_performance 
        (query_text, result_count, search_duration_ms, similarity_threshold, search_type)
        VALUES (?, ?, ?, ?, ?)
      `, [queryText, resultCount, durationMs, threshold, searchType]);
    } catch (error) {
      // Don't throw error for analytics logging failures
      console.warn('Failed to log search performance:', error);
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('Vector database connection closed');
    }
  }

  /**
   * Clear all embeddings (for testing/reset)
   */
  async clearAllEmbeddings() {
    if (!this.isInitialized) {
      throw new Error('Vector database not initialized');
    }

    try {
      await this.db.execute('DELETE FROM ingredient_embeddings');
      await this.db.execute('DELETE FROM vector_metadata');
      await this.db.execute('DELETE FROM search_performance');
      console.log('All vector data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear embeddings:', error);
      return false;
    }
  }
}

export default new VectorDatabase();