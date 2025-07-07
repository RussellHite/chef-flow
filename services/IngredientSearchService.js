/**
 * Ingredient Search Service
 * 
 * Handles ingredient search operations and indexing
 */

import { INGREDIENTS } from '../data/ingredientDatabase.js';
import IngredientSimilarityService from './IngredientSimilarityService.js';

export class IngredientSearchService {
  constructor() {
    this.searchIndex = this._buildSearchIndex();
    this.customIngredients = new Map();
  }

  /**
   * Build search index for fast ingredient lookup
   */
  _buildSearchIndex() {
    const index = new Map();
    
    Object.values(INGREDIENTS).forEach(ingredient => {
      // Index all search terms
      ingredient.searchTerms.forEach(term => {
        const key = term.toLowerCase();
        if (!index.has(key)) {
          index.set(key, []);
        }
        index.get(key).push(ingredient);
      });
      
      // Index partial matches
      ingredient.searchTerms.forEach(term => {
        for (let i = 1; i <= term.length; i++) {
          const partial = term.toLowerCase().substring(0, i);
          if (!index.has(partial)) {
            index.set(partial, []);
          }
          if (!index.get(partial).includes(ingredient)) {
            index.get(partial).push(ingredient);
          }
        }
      });
    });
    
    return index;
  }

  /**
   * Search for ingredients by name with intelligent similarity matching
   */
  async searchIngredients(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return Object.values(INGREDIENTS).slice(0, limit);
    }
    
    const searchTerm = (query || '').toLowerCase().trim();
    
    // Get all available ingredients (database + custom)
    const allIngredients = [
      ...Object.values(INGREDIENTS),
      ...Array.from(this.customIngredients.values())
    ];
    
    // Use similarity service for intelligent matching
    const similarityResults = IngredientSimilarityService.findBestMatches(
      searchTerm, 
      allIngredients, 
      limit * 2 // Get more candidates to filter/rank
    );
    
    // Fallback to original string-based search if similarity search yields poor results
    if (similarityResults.length === 0 || similarityResults[0].score < 30) {
      return this._fallbackStringSearch(searchTerm, limit);
    }
    
    // Return ingredients from similarity results
    return similarityResults
      .slice(0, limit)
      .map(result => result.ingredient);
  }

  /**
   * Fallback string-based search (original implementation)
   */
  _fallbackStringSearch(searchTerm, limit) {
    const results = new Set();
    
    // Exact matches first
    if (this.searchIndex.has(searchTerm)) {
      this.searchIndex.get(searchTerm).forEach(ingredient => results.add(ingredient));
    }
    
    // Partial matches
    for (const [key, ingredients] of this.searchIndex.entries()) {
      if (key.includes(searchTerm) && results.size < limit) {
        ingredients.forEach(ingredient => results.add(ingredient));
      }
    }
    
    // Include custom ingredients
    for (const customIngredient of this.customIngredients.values()) {
      if (customIngredient.searchTerms.some(term => 
        (term || '').toLowerCase().includes(searchTerm)) && results.size < limit) {
        results.add(customIngredient);
      }
    }
    
    return Array.from(results).slice(0, limit);
  }

  /**
   * Calculate how well an ingredient text matches a known ingredient
   * Now uses the enhanced similarity service
   */
  calculateIngredientMatchScore(text, ingredient) {
    // Use the new similarity service for more intelligent scoring
    return IngredientSimilarityService.calculateSimilarity(text, ingredient);
  }

  /**
   * Add a custom ingredient to search index
   */
  addCustomIngredientToIndex(ingredient) {
    this.customIngredients.set(ingredient.id, ingredient);
    
    // Update search index
    ingredient.searchTerms.forEach(term => {
      const key = term.toLowerCase();
      if (!this.searchIndex.has(key)) {
        this.searchIndex.set(key, []);
      }
      this.searchIndex.get(key).push(ingredient);
    });
  }

  /**
   * Check if a text part looks like a preparation method
   */
  looksLikePreparation(text) {
    const preparationWords = [
      'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded',
      'peeled', 'crushed', 'julienned', 'cubed', 'halved', 'quartered',
      'trimmed', 'cored', 'pitted', 'seeded', 'sifted', 'drained',
      'rinsed', 'dried', 'juiced', 'fresh', 'frozen', 'canned',
      'cooked', 'raw', 'roasted', 'grilled', 'steamed'
    ];
    
    const lowerText = text.toLowerCase();
    return preparationWords.some(word => lowerText.includes(word));
  }
}