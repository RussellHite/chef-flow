/**
 * Ingredient Service Instance
 * 
 * Singleton instance of the ingredient service using embedded data source
 * This can be easily swapped to use a server-based data source later
 */

import IngredientService from './IngredientService.js';
import EmbeddedIngredientDataSource from './EmbeddedIngredientDataSource.js';

// Create singleton instance
const dataSource = new EmbeddedIngredientDataSource();
const ingredientService = new IngredientService(dataSource);

export default ingredientService;