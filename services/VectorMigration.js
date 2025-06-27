/**
 * Vector Database Migration Service
 * 
 * Handles migration of existing ingredients to the vector database
 * Generates embeddings for all ingredients in the ingredient database
 */

import VectorService from './VectorService';
import VectorDatabase from './VectorDatabase';
import ingredientService from './ingredientServiceInstance';

class VectorMigration {
  constructor() {
    this.isMigrating = false;
    this.migrationProgress = {
      total: 0,
      processed: 0,
      failed: 0,
      startTime: null,
      estimatedTimeRemaining: null
    };
  }

  /**
   * Start migration of existing ingredients to vector database
   */
  async startMigration() {
    if (this.isMigrating) {
      console.log('Migration already in progress');
      return false;
    }

    try {
      console.log('Starting vector database migration...');
      this.isMigrating = true;
      this.migrationProgress.startTime = Date.now();

      // Initialize services if not already done
      if (!VectorService.isInitialized) {
        await VectorService.initialize();
      }

      if (!VectorDatabase.isInitialized) {
        await VectorDatabase.initialize();
      }

      // Get all ingredients from the ingredient service
      const allIngredients = await this.getAllIngredients();
      this.migrationProgress.total = allIngredients.length;

      console.log(`Found ${allIngredients.length} ingredients to migrate`);

      // Process ingredients in batches for better performance
      const batchSize = 10;
      for (let i = 0; i < allIngredients.length; i += batchSize) {
        const batch = allIngredients.slice(i, i + batchSize);
        await this.processBatch(batch);
        
        // Update progress
        this.migrationProgress.processed = Math.min(i + batchSize, allIngredients.length);
        this.updateEstimatedTime();
        
        console.log(`Migration progress: ${this.migrationProgress.processed}/${this.migrationProgress.total}`);
      }

      console.log('Vector database migration completed successfully');
      this.isMigrating = false;
      return true;

    } catch (error) {
      console.error('Vector database migration failed:', error);
      this.isMigrating = false;
      return false;
    }
  }

  /**
   * Process a batch of ingredients
   */
  async processBatch(ingredients) {
    const embeddings = [];

    for (const ingredient of ingredients) {
      try {
        // Check if embedding already exists
        const existing = await VectorDatabase.getEmbedding(ingredient.id);
        if (existing) {
          console.log(`Skipping ${ingredient.name} - embedding already exists`);
          continue;
        }

        // Generate embedding
        const embedding = await VectorService.generateEmbedding(ingredient.name);
        
        embeddings.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          embedding: embedding
        });

        console.log(`Generated embedding for: ${ingredient.name}`);

      } catch (error) {
        console.error(`Failed to process ingredient ${ingredient.name}:`, error);
        this.migrationProgress.failed++;
      }
    }

    // Batch store embeddings
    if (embeddings.length > 0) {
      const success = await VectorDatabase.batchStoreEmbeddings(embeddings);
      if (!success) {
        console.error('Failed to store batch of embeddings');
        this.migrationProgress.failed += embeddings.length;
      }
    }
  }

  /**
   * Get all ingredients from the ingredient database
   */
  async getAllIngredients() {
    try {
      // Get ingredients from the embedded ingredient database
      const ingredients = [];
      
      // Import the ingredient database
      const { INGREDIENTS } = await import('../data/ingredientDatabase.js');
      
      // Convert to array format with IDs
      for (const [id, ingredient] of Object.entries(INGREDIENTS)) {
        ingredients.push({
          id: id,
          name: ingredient.name,
          category: ingredient.category,
          searchTerms: ingredient.searchTerms || []
        });
      }

      // Also get any additional ingredients from the ingredient service
      try {
        const serviceIngredients = await ingredientService.searchIngredients('', 1000);
        for (const serviceIngredient of serviceIngredients) {
          // Avoid duplicates
          if (!ingredients.find(ing => ing.id === serviceIngredient.id)) {
            ingredients.push({
              id: serviceIngredient.id,
              name: serviceIngredient.name,
              category: serviceIngredient.category || 'unknown'
            });
          }
        }
      } catch (serviceError) {
        console.warn('Could not load additional ingredients from service:', serviceError);
      }

      return ingredients;

    } catch (error) {
      console.error('Failed to get all ingredients:', error);
      return [];
    }
  }

  /**
   * Update estimated time remaining
   */
  updateEstimatedTime() {
    if (this.migrationProgress.processed === 0) return;

    const elapsed = Date.now() - this.migrationProgress.startTime;
    const rate = this.migrationProgress.processed / elapsed; // items per ms
    const remaining = this.migrationProgress.total - this.migrationProgress.processed;
    
    this.migrationProgress.estimatedTimeRemaining = remaining / rate;
  }

  /**
   * Get migration progress
   */
  getProgress() {
    return {
      ...this.migrationProgress,
      isActive: this.isMigrating,
      percentComplete: this.migrationProgress.total > 0 
        ? (this.migrationProgress.processed / this.migrationProgress.total) * 100 
        : 0
    };
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded() {
    try {
      if (!VectorDatabase.isInitialized) {
        await VectorDatabase.initialize();
      }

      const stats = await VectorDatabase.getStats();
      const allIngredients = await this.getAllIngredients();
      
      // Migration needed if we have significantly fewer embeddings than ingredients
      const migrationNeeded = stats.totalEmbeddings < (allIngredients.length * 0.8);
      
      console.log(`Migration check: ${stats.totalEmbeddings} embeddings vs ${allIngredients.length} ingredients`);
      console.log(`Migration needed: ${migrationNeeded}`);
      
      return migrationNeeded;

    } catch (error) {
      console.error('Failed to check migration status:', error);
      return true; // Assume migration is needed if check fails
    }
  }

  /**
   * Clear all vector data (for testing/reset)
   */
  async clearVectorData() {
    try {
      if (!VectorDatabase.isInitialized) {
        await VectorDatabase.initialize();
      }

      await VectorDatabase.clearAllEmbeddings();
      console.log('All vector data cleared successfully');
      return true;

    } catch (error) {
      console.error('Failed to clear vector data:', error);
      return false;
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration() {
    try {
      const stats = await VectorDatabase.getStats();
      const allIngredients = await this.getAllIngredients();
      
      const coverage = stats.totalEmbeddings / allIngredients.length;
      const isComplete = coverage >= 0.95; // 95% coverage considered complete
      
      return {
        totalIngredients: allIngredients.length,
        totalEmbeddings: stats.totalEmbeddings,
        coverage: coverage,
        isComplete: isComplete,
        missingEmbeddings: allIngredients.length - stats.totalEmbeddings
      };

    } catch (error) {
      console.error('Failed to verify migration:', error);
      return { error: error.message };
    }
  }
}

export default new VectorMigration();