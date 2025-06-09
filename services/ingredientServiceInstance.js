/**
 * Ingredient Service Instance
 * 
 * Singleton instance of the ingredient service using embedded data source
 * This can be easily swapped to use a server-based data source later
 * 
 * Enhanced with vector capabilities for similarity search and smart parsing
 */

import IngredientService from './IngredientService.js';
import EmbeddedIngredientDataSource from './EmbeddedIngredientDataSource.js';

// Create singleton instance
const dataSource = new EmbeddedIngredientDataSource();
const ingredientService = new IngredientService(dataSource);

// Initialize vector capabilities
ingredientService.initialize().catch(error => {
  console.warn('Failed to initialize vector capabilities:', error);
});

export default ingredientService;