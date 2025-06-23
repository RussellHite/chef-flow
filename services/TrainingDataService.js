/**
 * Training Data Service
 * 
 * Manages ingredient parsing training data and applies learned patterns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class TrainingDataService {
  constructor() {
    this.trainingData = [];
    this.loadTrainingData();
  }

  /**
   * Load training data from AsyncStorage
   */
  async loadTrainingData() {
    try {
      const data = await AsyncStorage.getItem('ingredientParsingTraining');
      this.trainingData = data ? JSON.parse(data) : [];
      return this.trainingData;
    } catch (error) {
      console.error('Error loading training data:', error);
      this.trainingData = [];
      return [];
    }
  }

  /**
   * Save new training data
   */
  async saveTrainingData(originalText, manualParsing) {
    const newEntry = {
      id: Date.now(),
      originalText,
      manualParsing,
      timestamp: new Date().toISOString()
    };

    this.trainingData.push(newEntry);
    
    try {
      await AsyncStorage.setItem('ingredientParsingTraining', JSON.stringify(this.trainingData));
      // console.log('Saved training data:', newEntry);
      return newEntry;
    } catch (error) {
      console.error('Error saving training data:', error);
      return null;
    }
  }

  /**
   * Find similar training examples for a given text
   */
  findSimilarTrainingExamples(text, threshold = 0.7) {
    return this.trainingData.filter(entry => {
      const similarity = this.calculateSimilarity(text, entry.originalText);
      return similarity >= threshold;
    }).sort((a, b) => {
      const simA = this.calculateSimilarity(text, a.originalText);
      const simB = this.calculateSimilarity(text, b.originalText);
      return simB - simA; // Highest similarity first
    });
  }

  /**
   * Calculate text similarity (enhanced with cooking-specific logic)
   */
  calculateSimilarity(text1, text2) {
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[(),]/g, '') // Remove parentheses and commas
        .replace(/\b(tablespoons?|tbsp)\b/g, 'tablespoon')
        .replace(/\b(teaspoons?|tsp)\b/g, 'teaspoon')
        .replace(/\b(ounces?|oz)\b/g, 'ounce')
        .replace(/\b(pounds?|lbs?)\b/g, 'pound')
        .replace(/\b(cups?)\b/g, 'cup')
        .replace(/\b(pieces?)\b/g, 'piece')
        .replace(/\b(cloves?)\b/g, 'clove')
        .replace(/\b(sprigs?)\b/g, 'sprig')
        .replace(/\b(halves?)\b/g, 'half')
        .split(/\s+/)
        .filter(word => word.length > 1); // Remove single characters
    };
    
    const words1 = normalize(text1);
    const words2 = normalize(text2);
    
    // Calculate exact word matches
    const exactMatches = words1.filter(word => words2.includes(word)).length;
    
    // Calculate partial matches (for compound words like "chicken breast")
    let partialMatches = 0;
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1.length > 3 && word2.length > 3) {
          if (word1.includes(word2) || word2.includes(word1)) {
            partialMatches += 0.5;
          }
        }
      });
    });
    
    const totalWords = new Set([...words1, ...words2]).size;
    return (exactMatches + partialMatches) / totalWords;
  }

  /**
   * Apply training data to improve ingredient parsing
   */
  applyTrainingToIngredient(originalText) {
    const similarExamples = this.findSimilarTrainingExamples(originalText, 0.8);
    
    if (similarExamples.length > 0) {
      const bestMatch = similarExamples[0];
      // console.log('Found training match for:', originalText, '→', bestMatch.manualParsing);
      
      // Apply the learned pattern
      return this.adaptTrainingPattern(originalText, bestMatch);
    }
    
    return null;
  }

  /**
   * Adapt a training pattern to new text
   */
  adaptTrainingPattern(newText, trainingExample) {
    const { manualParsing } = trainingExample;
    
    // Use the structured data from training if available
    const structuredTraining = manualParsing.structured;
    if (structuredTraining) {
      return this.adaptFromStructuredTraining(newText, structuredTraining, manualParsing);
    }
    
    // Fallback to original adaptation logic
    return this.adaptFromManualParsing(newText, manualParsing);
  }

  /**
   * Adapt from structured training data (more accurate)
   */
  adaptFromStructuredTraining(newText, structuredTraining, manualParsing) {
    const newWords = newText.toLowerCase().split(/\s+/);
    
    // Find quantities in new text
    const quantityRegex = /\d+(?:\.\d+)?(?:\/\d+)?(?:\s*\([^)]+\))?/;
    const quantityMatch = newText.match(quantityRegex);
    let quantity = quantityMatch ? parseFloat(quantityMatch[0].match(/\d+(?:\.\d+)?/)[0]) : structuredTraining.quantity;
    
    // Find units using training pattern
    let unit = null;
    if (structuredTraining.unit) {
      const unitPattern = new RegExp(`\\b(${structuredTraining.unit.name}|${structuredTraining.unit.plural}|tablespoons?|tbsp|teaspoons?|tsp|cups?|ounces?|oz|pounds?|lbs?|grams?|g|sprigs?|pinch|pinches)\\b`, 'i');
      const unitMatch = newText.match(unitPattern);
      if (unitMatch) {
        unit = {
          value: unitMatch[1].toLowerCase(),
          name: unitMatch[1].toLowerCase(),
          plural: unitMatch[1].toLowerCase().endsWith('s') ? unitMatch[1].toLowerCase() : unitMatch[1].toLowerCase() + 's'
        };
      }
    }
    
    // Adapt ingredient name using training pattern
    let ingredientName = null;
    if (structuredTraining.ingredient) {
      // Look for core ingredient words
      const trainingIngredientWords = structuredTraining.ingredient.name.toLowerCase().split(/\s+/);
      const matchingWords = newWords.filter(word => 
        trainingIngredientWords.some(trainWord => 
          word.includes(trainWord) || trainWord.includes(word)
        )
      );
      
      if (matchingWords.length > 0) {
        ingredientName = matchingWords.join(' ');
      } else {
        // Fallback: exclude quantities, units, and prep words
        const excludeWords = ['tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp', 
                             'cup', 'cups', 'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs',
                             'gram', 'grams', 'g', 'sprig', 'sprigs', 'pinch', 'pinches',
                             'chopped', 'diced', 'sliced', 'minced', 'fresh', 'dried', 'divided',
                             'for', 'garnish', 'medium', 'large', 'small'];
        
        const coreWords = newWords.filter(word => 
          !quantityRegex.test(word) && 
          !excludeWords.includes(word) &&
          !word.match(/^\d+$/) &&
          !word.match(/^\([^)]*\)$/)
        );
        
        ingredientName = coreWords.join(' ');
      }
    }
    
    // Adapt preparation using remaining context
    let preparation = null;
    if (structuredTraining.preparation || manualParsing.description) {
      const allText = newText.toLowerCase();
      const prepWords = [];
      
      // Extract parenthetical info
      const parenthetical = allText.match(/\([^)]*\)/g);
      if (parenthetical) {
        prepWords.push(...parenthetical);
      }
      
      // Extract descriptive words
      const descriptors = ['fresh', 'dried', 'chopped', 'diced', 'sliced', 'minced', 'divided', 
                          'medium', 'large', 'small', 'skinless', 'boneless', 'juiced', 'halves',
                          'for garnish', 'garnish'];
      
      newWords.forEach(word => {
        if (descriptors.some(desc => word.includes(desc) || desc.includes(word))) {
          if (!prepWords.includes(word)) {
            prepWords.push(word);
          }
        }
      });
      
      if (prepWords.length > 0) {
        preparation = prepWords.join(' ').replace(/\s+/g, ' ').trim();
      }
    }
    
    return {
      quantity: quantity,
      unit: unit,
      ingredient: ingredientName ? { 
        id: 'trained', 
        name: ingredientName, 
        category: 'custom' 
      } : null,
      preparation: preparation ? { 
        id: 'trained', 
        name: preparation, 
        requiresStep: true 
      } : null,
      originalText: newText,
      isStructured: true
    };
  }

  /**
   * Fallback adaptation from manual parsing
   */
  adaptFromManualParsing(newText, manualParsing) {
    const newWords = newText.toLowerCase().split(/\s+/);
    
    // Simple adaptation: map similar word positions
    const adapted = {
      quantity: null,
      unit: null,
      ingredient: null,
      preparation: null
    };

    // Find quantities in new text
    const quantityRegex = /\d+(?:\.\d+)?(?:\/\d+)?/;
    const quantityMatch = newText.match(quantityRegex);
    if (quantityMatch) {
      adapted.quantity = quantityMatch[0];
    }

    // Find units (if training example had units)
    if (manualParsing.unit) {
      const unitWords = ['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'lbs', 'gram', 'grams', 'can', 'cans', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'sprig', 'sprigs', 'pinch'];
      const foundUnit = newWords.find(word => unitWords.includes(word));
      if (foundUnit) {
        adapted.unit = foundUnit;
      }
    }

    // Adapt ingredient name (exclude quantities and units)
    const ingredientWords = newWords.filter(word => 
      !quantityRegex.test(word) && 
      !['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'lbs', 'gram', 'grams', 'can', 'cans', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'sprig', 'sprigs', 'pinch'].includes(word) &&
      !this.isPreparationWord(word)
    );
    
    if (ingredientWords.length > 0) {
      adapted.ingredient = ingredientWords.join(' ');
    }

    // Find preparation words
    const prepWords = newWords.filter(word => this.isPreparationWord(word));
    if (prepWords.length > 0) {
      adapted.preparation = prepWords.join(' ');
    }

    return {
      quantity: adapted.quantity,
      unit: adapted.unit ? { 
        value: adapted.unit, 
        name: adapted.unit, 
        plural: adapted.unit.endsWith('s') ? adapted.unit : adapted.unit + 's' 
      } : null,
      ingredient: adapted.ingredient ? { 
        id: 'trained', 
        name: adapted.ingredient, 
        category: 'custom' 
      } : null,
      preparation: adapted.preparation ? { 
        id: 'trained', 
        name: adapted.preparation, 
        requiresStep: true 
      } : null,
      originalText: newText,
      isStructured: true
    };
  }

  /**
   * Check if a word is likely a preparation method
   */
  isPreparationWord(word) {
    const preparationWords = [
      'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded',
      'peeled', 'crushed', 'julienned', 'cubed', 'halved', 'quartered',
      'trimmed', 'cored', 'pitted', 'seeded', 'sifted', 'drained',
      'rinsed', 'dried', 'juiced', 'fresh', 'frozen', 'canned',
      'cooked', 'raw', 'roasted', 'grilled', 'steamed'
    ];
    
    return preparationWords.includes(word.toLowerCase());
  }

  /**
   * Get training statistics
   */
  getStats() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recent = this.trainingData.filter(item => new Date(item.timestamp) > oneDayAgo);
    const thisWeek = this.trainingData.filter(item => new Date(item.timestamp) > oneWeekAgo);
    
    return {
      total: this.trainingData.length,
      recent: recent.length,
      thisWeek: thisWeek.length
    };
  }

  /**
   * Delete a specific training item
   */
  async deleteTrainingItem(itemId) {
    this.trainingData = this.trainingData.filter(item => item.id !== itemId);
    try {
      await AsyncStorage.setItem('ingredientParsingTraining', JSON.stringify(this.trainingData));
      return true;
    } catch (error) {
      console.error('Error deleting training item:', error);
      return false;
    }
  }

  /**
   * Clear all training data
   */
  async clearAllData() {
    this.trainingData = [];
    try {
      await AsyncStorage.removeItem('ingredientParsingTraining');
    } catch (error) {
      console.error('Error clearing training data:', error);
    }
  }

  /**
   * Export training data for analysis
   */
  exportData() {
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: this.trainingData
    };
  }
}

export default new TrainingDataService();