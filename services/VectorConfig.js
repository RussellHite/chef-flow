/**
 * Vector Configuration Service
 * 
 * Manages feature flags and configuration for vector database functionality
 * Provides runtime control over vector features and performance settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class VectorConfig {
  constructor() {
    this.config = {
      // Feature flags
      vectorFeaturesEnabled: true,
      realEmbeddingsEnabled: true,
      vectorDatabaseEnabled: true,
      migrationAutoStart: false,
      
      // Performance settings
      maxSequenceLength: 256,
      embeddingCacheSize: 1000,
      batchSize: 10,
      fallbackTimeout: 500, // ms
      similarityThreshold: 0.5,
      maxSimilarResults: 10,
      
      // Model settings
      modelVersion: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      
      // Database settings
      dbPath: 'chef_flow_vectors.db',
      enablePerformanceLogging: true,
      cacheToDatabase: true,
      
      // Memory management
      maxCacheMemoryMB: 50,
      embeddingGCInterval: 300000, // 5 minutes
      
      // Development settings
      debugMode: false,
      verboseLogging: false
    };
    
    this.listeners = new Set();
    this.isLoaded = false;
  }

  /**
   * Initialize configuration from storage
   */
  async initialize() {
    try {
      const storedConfig = await AsyncStorage.getItem('vectorConfig');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
        this.config = { ...this.config, ...parsed };
      }
      
      this.isLoaded = true;
      this.notifyListeners();
      console.log('Vector configuration loaded:', this.config);
      
      return true;
    } catch (error) {
      console.error('Failed to load vector configuration:', error);
      this.isLoaded = true;
      return false;
    }
  }

  /**
   * Save configuration to storage
   */
  async saveConfig() {
    try {
      await AsyncStorage.setItem('vectorConfig', JSON.stringify(this.config));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to save vector configuration:', error);
      return false;
    }
  }

  /**
   * Get configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set configuration value
   */
  async set(key, value) {
    const oldValue = this.config[key];
    this.config[key] = value;
    
    // Save to storage
    await this.saveConfig();
    
    console.log(`Vector config updated: ${key} = ${value} (was ${oldValue})`);
    return true;
  }

  /**
   * Update multiple configuration values
   */
  async update(updates) {
    const changes = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (this.config[key] !== value) {
        changes[key] = { from: this.config[key], to: value };
        this.config[key] = value;
      }
    }
    
    if (Object.keys(changes).length > 0) {
      await this.saveConfig();
      console.log('Vector config batch update:', changes);
    }
    
    return true;
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Reset to defaults
   */
  async reset() {
    const defaultConfig = {
      vectorFeaturesEnabled: true,
      realEmbeddingsEnabled: true,
      vectorDatabaseEnabled: true,
      migrationAutoStart: false,
      maxSequenceLength: 256,
      embeddingCacheSize: 1000,
      batchSize: 10,
      fallbackTimeout: 500,
      similarityThreshold: 0.5,
      maxSimilarResults: 10,
      modelVersion: 'all-MiniLM-L6-v2',
      embeddingDimension: 384,
      dbPath: 'chef_flow_vectors.db',
      enablePerformanceLogging: true,
      cacheToDatabase: true,
      maxCacheMemoryMB: 50,
      embeddingGCInterval: 300000,
      debugMode: false,
      verboseLogging: false
    };
    
    this.config = defaultConfig;
    await this.saveConfig();
    console.log('Vector configuration reset to defaults');
    
    return true;
  }

  /**
   * Feature flag methods
   */
  isVectorFeaturesEnabled() {
    return this.config.vectorFeaturesEnabled;
  }

  isRealEmbeddingsEnabled() {
    return this.config.realEmbeddingsEnabled && this.config.vectorFeaturesEnabled;
  }

  isVectorDatabaseEnabled() {
    return this.config.vectorDatabaseEnabled && this.config.vectorFeaturesEnabled;
  }

  isDebugMode() {
    return this.config.debugMode;
  }

  /**
   * Performance configuration
   */
  getPerformanceConfig() {
    return {
      maxSequenceLength: this.config.maxSequenceLength,
      embeddingCacheSize: this.config.embeddingCacheSize,
      batchSize: this.config.batchSize,
      fallbackTimeout: this.config.fallbackTimeout,
      maxCacheMemoryMB: this.config.maxCacheMemoryMB,
      embeddingGCInterval: this.config.embeddingGCInterval
    };
  }

  /**
   * Search configuration
   */
  getSearchConfig() {
    return {
      similarityThreshold: this.config.similarityThreshold,
      maxSimilarResults: this.config.maxSimilarResults,
      fallbackTimeout: this.config.fallbackTimeout
    };
  }

  /**
   * Model configuration
   */
  getModelConfig() {
    return {
      modelVersion: this.config.modelVersion,
      embeddingDimension: this.config.embeddingDimension,
      maxSequenceLength: this.config.maxSequenceLength
    };
  }

  /**
   * Database configuration
   */
  getDatabaseConfig() {
    return {
      dbPath: this.config.dbPath,
      enablePerformanceLogging: this.config.enablePerformanceLogging,
      cacheToDatabase: this.config.cacheToDatabase
    };
  }

  /**
   * Add configuration change listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of configuration changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('Vector config listener error:', error);
      }
    });
  }

  /**
   * Quick toggle methods for common features
   */
  async toggleVectorFeatures() {
    const newValue = !this.config.vectorFeaturesEnabled;
    await this.set('vectorFeaturesEnabled', newValue);
    return newValue;
  }

  async toggleRealEmbeddings() {
    const newValue = !this.config.realEmbeddingsEnabled;
    await this.set('realEmbeddingsEnabled', newValue);
    return newValue;
  }

  async toggleVectorDatabase() {
    const newValue = !this.config.vectorDatabaseEnabled;
    await this.set('vectorDatabaseEnabled', newValue);
    return newValue;
  }

  async toggleDebugMode() {
    const newValue = !this.config.debugMode;
    await this.set('debugMode', newValue);
    await this.set('verboseLogging', newValue);
    return newValue;
  }

  /**
   * Get configuration for admin/debug display
   */
  getConfigForDisplay() {
    return {
      'Feature Flags': {
        'Vector Features': this.config.vectorFeaturesEnabled,
        'Real Embeddings': this.config.realEmbeddingsEnabled,
        'Vector Database': this.config.vectorDatabaseEnabled,
        'Auto Migration': this.config.migrationAutoStart,
        'Debug Mode': this.config.debugMode
      },
      'Performance': {
        'Max Sequence Length': this.config.maxSequenceLength,
        'Cache Size': this.config.embeddingCacheSize,
        'Batch Size': this.config.batchSize,
        'Fallback Timeout': `${this.config.fallbackTimeout}ms`,
        'Max Cache Memory': `${this.config.maxCacheMemoryMB}MB`
      },
      'Search': {
        'Similarity Threshold': this.config.similarityThreshold,
        'Max Results': this.config.maxSimilarResults
      },
      'Model': {
        'Version': this.config.modelVersion,
        'Embedding Dimension': this.config.embeddingDimension
      }
    };
  }

  /**
   * Validate configuration values
   */
  validateConfig() {
    const errors = [];
    
    if (this.config.maxSequenceLength < 16 || this.config.maxSequenceLength > 512) {
      errors.push('maxSequenceLength must be between 16 and 512');
    }
    
    if (this.config.embeddingCacheSize < 10 || this.config.embeddingCacheSize > 10000) {
      errors.push('embeddingCacheSize must be between 10 and 10000');
    }
    
    if (this.config.similarityThreshold < 0 || this.config.similarityThreshold > 1) {
      errors.push('similarityThreshold must be between 0 and 1');
    }
    
    if (this.config.embeddingDimension !== 384) {
      errors.push('embeddingDimension must be 384 for all-MiniLM-L6-v2');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

export default new VectorConfig();