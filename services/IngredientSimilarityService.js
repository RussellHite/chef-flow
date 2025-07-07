/**
 * Ingredient Similarity Service
 * 
 * Provides intelligent ingredient matching using multiple similarity algorithms
 * Designed to be Expo Go compatible while providing vector-like capabilities
 */

export class IngredientSimilarityService {
  constructor() {
    this.synonymMap = this._buildSynonymMap();
    this.phoneticCache = new Map();
  }

  /**
   * Calculate comprehensive similarity score between query and ingredient
   * @param {string} query - User input text
   * @param {Object} ingredient - Ingredient object with name, searchTerms, category
   * @returns {number} Similarity score from 0-100
   */
  calculateSimilarity(query, ingredient) {
    if (!query || !ingredient || !ingredient.name) return 0;

    const queryNorm = this._normalizeText(query);
    const ingredientNorm = this._normalizeText(ingredient.name);
    
    // Multiple scoring mechanisms
    const scores = {
      exact: this._exactMatchScore(queryNorm, ingredientNorm),
      edit: this._editDistanceScore(queryNorm, ingredientNorm),
      phonetic: this._phoneticScore(queryNorm, ingredientNorm),
      synonym: this._synonymScore(queryNorm, ingredient),
      category: this._categoryScore(queryNorm, ingredient),
      partial: this._partialMatchScore(queryNorm, ingredient),
      searchTerms: this._searchTermsScore(queryNorm, ingredient)
    };

    // Weighted combination of scores
    const totalScore = (
      scores.exact * 0.35 +       // Highest weight for exact matches
      scores.edit * 0.20 +        // Edit distance for typos
      scores.phonetic * 0.15 +    // Phonetic similarity
      scores.synonym * 0.15 +     // Known synonyms
      scores.searchTerms * 0.10 + // Search terms matching
      scores.partial * 0.03 +     // Partial matches
      scores.category * 0.02      // Category matching
    );

    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Find best matching ingredients for a query
   * @param {string} query - Search query
   * @param {Array} ingredients - Array of ingredient objects
   * @param {number} limit - Maximum results to return
   * @returns {Array} Sorted array of {ingredient, score} objects
   */
  findBestMatches(query, ingredients, limit = 10) {
    if (!query || !ingredients || ingredients.length === 0) return [];

    const results = ingredients
      .map(ingredient => ({
        ingredient,
        score: this.calculateSimilarity(query, ingredient)
      }))
      .filter(result => result.score > 10) // Minimum threshold
      .sort((a, b) => b.score - a.score)  // Highest score first
      .slice(0, limit);

    return results;
  }

  /**
   * Check if an ingredient name is a likely variation of another
   * @param {string} name1 - First ingredient name
   * @param {string} name2 - Second ingredient name
   * @returns {boolean} True if likely variations
   */
  areLikelyVariations(name1, name2) {
    const similarity = this.calculateSimilarity(name1, { name: name2, searchTerms: [name2] });
    return similarity > 70;
  }

  // Private helper methods

  _normalizeText(text) {
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _exactMatchScore(query, ingredientName) {
    if (query === ingredientName) return 100;
    
    // Check if query is contained in ingredient name or vice versa
    if (ingredientName.includes(query) || query.includes(ingredientName)) {
      const shorter = Math.min(query.length, ingredientName.length);
      const longer = Math.max(query.length, ingredientName.length);
      return 80 * (shorter / longer);
    }
    
    return 0;
  }

  _editDistanceScore(query, ingredientName) {
    const distance = this._levenshteinDistance(query, ingredientName);
    const maxLength = Math.max(query.length, ingredientName.length);
    
    if (maxLength === 0) return 100;
    
    const similarity = (1 - distance / maxLength) * 100;
    return Math.max(0, similarity);
  }

  _phoneticScore(query, ingredientName) {
    const queryPhonetic = this._soundex(query);
    const ingredientPhonetic = this._soundex(ingredientName);
    
    if (queryPhonetic === ingredientPhonetic) return 70;
    
    // Check if first 2 characters match (rough phonetic similarity)
    if (queryPhonetic.slice(0, 2) === ingredientPhonetic.slice(0, 2)) return 30;
    
    return 0;
  }

  _synonymScore(query, ingredient) {
    const synonyms = this.synonymMap.get(this._normalizeText(ingredient.name)) || [];
    
    for (const synonym of synonyms) {
      if (this._normalizeText(synonym) === query) return 90;
      if (this._normalizeText(synonym).includes(query) || query.includes(this._normalizeText(synonym))) {
        return 60;
      }
    }
    
    return 0;
  }

  _categoryScore(query, ingredient) {
    if (!ingredient.category) return 0;
    
    const categoryNorm = this._normalizeText(ingredient.category);
    if (query.includes(categoryNorm) || categoryNorm.includes(query)) {
      return 20;
    }
    
    return 0;
  }

  _partialMatchScore(query, ingredient) {
    const ingredientWords = ingredient.name.toLowerCase().split(/\s+/);
    const queryWords = query.split(/\s+/);
    
    let matchingWords = 0;
    for (const queryWord of queryWords) {
      for (const ingredientWord of ingredientWords) {
        if (ingredientWord.includes(queryWord) || queryWord.includes(ingredientWord)) {
          matchingWords++;
          break;
        }
      }
    }
    
    const score = (matchingWords / Math.max(queryWords.length, ingredientWords.length)) * 40;
    return score;
  }

  _searchTermsScore(query, ingredient) {
    if (!ingredient.searchTerms || ingredient.searchTerms.length === 0) return 0;
    
    for (const term of ingredient.searchTerms) {
      const termNorm = this._normalizeText(term);
      if (termNorm === query) return 85;
      if (termNorm.includes(query) || query.includes(termNorm)) return 50;
    }
    
    return 0;
  }

  _levenshteinDistance(str1, str2) {
    const matrix = [];
    
    // Initialize first row and column
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,  // substitution
            matrix[i][j - 1] + 1,      // insertion
            matrix[i - 1][j] + 1       // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  _soundex(str) {
    // Check cache first
    if (this.phoneticCache.has(str)) {
      return this.phoneticCache.get(str);
    }

    // Simple Soundex algorithm implementation
    let soundex = str.charAt(0).toUpperCase();
    
    const mapping = {
      'B': '1', 'F': '1', 'P': '1', 'V': '1',
      'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
      'D': '3', 'T': '3',
      'L': '4',
      'M': '5', 'N': '5',
      'R': '6'
    };
    
    for (let i = 1; i < str.length && soundex.length < 4; i++) {
      const char = str.charAt(i).toUpperCase();
      const code = mapping[char];
      
      if (code && soundex.slice(-1) !== code) {
        soundex += code;
      }
    }
    
    // Pad with zeros if needed
    while (soundex.length < 4) {
      soundex += '0';
    }
    
    // Cache result
    this.phoneticCache.set(str, soundex);
    return soundex;
  }

  _buildSynonymMap() {
    // Pre-built synonym map for common ingredient variations
    const synonymData = {
      'tomato': ['roma tomato', 'cherry tomato', 'plum tomato', 'beefsteak tomato', 'heirloom tomato'],
      'onion': ['yellow onion', 'white onion', 'sweet onion', 'red onion', 'spanish onion'],
      'bell pepper': ['green bell pepper', 'red bell pepper', 'yellow bell pepper', 'orange bell pepper'],
      'chicken breast': ['boneless chicken breast', 'skinless chicken breast', 'chicken breast fillet'],
      'ground beef': ['lean ground beef', 'ground chuck', 'hamburger meat'],
      'olive oil': ['extra virgin olive oil', 'light olive oil', 'pure olive oil'],
      'garlic': ['garlic clove', 'fresh garlic', 'garlic bulb'],
      'butter': ['unsalted butter', 'salted butter', 'sweet butter'],
      'flour': ['all purpose flour', 'wheat flour', 'white flour'],
      'sugar': ['white sugar', 'granulated sugar', 'cane sugar'],
      'rice': ['white rice', 'long grain rice', 'jasmine rice', 'basmati rice'],
      'pasta': ['spaghetti', 'penne', 'linguine', 'fettuccine', 'macaroni'],
      'cheese': ['cheddar cheese', 'mozzarella cheese', 'swiss cheese', 'parmesan cheese'],
      'milk': ['whole milk', '2% milk', 'skim milk', 'low fat milk'],
      'bread': ['white bread', 'wheat bread', 'sourdough bread', 'french bread'],
      'potato': ['russet potato', 'red potato', 'yukon potato', 'sweet potato'],
      'carrot': ['baby carrot', 'large carrot', 'medium carrot'],
      'celery': ['celery stalk', 'celery rib'],
      'lettuce': ['romaine lettuce', 'iceberg lettuce', 'butter lettuce'],
      'apple': ['red apple', 'green apple', 'gala apple', 'granny smith apple'],
      'lemon': ['lemon juice', 'fresh lemon', 'lemon zest'],
      'lime': ['lime juice', 'fresh lime', 'lime zest'],
      
      // Additional common synonyms
      'scallion': ['green onion', 'spring onion', 'bunch onion'],
      'cilantro': ['coriander', 'fresh cilantro', 'coriander leaves'],
      'bell pepper': ['sweet pepper', 'capsicum'],
      'eggplant': ['aubergine'],
      'zucchini': ['courgette'],
      'shrimp': ['prawns', 'jumbo shrimp', 'medium shrimp'],
      'ground turkey': ['turkey mince', 'lean ground turkey'],
      'heavy cream': ['heavy whipping cream', 'double cream'],
      'sour cream': ['crème fraîche'],
      'mushroom': ['button mushroom', 'white mushroom', 'cremini mushroom'],
      'spinach': ['baby spinach', 'fresh spinach', 'leaf spinach'],
      'basil': ['fresh basil', 'sweet basil'],
      'parsley': ['fresh parsley', 'flat leaf parsley', 'curly parsley'],
      'thyme': ['fresh thyme', 'dried thyme'],
      'oregano': ['fresh oregano', 'dried oregano'],
      'vanilla': ['vanilla extract', 'pure vanilla', 'vanilla essence'],
      'baking powder': ['double acting baking powder'],
      'sea salt': ['kosher salt', 'table salt', 'fine salt'],
      'black pepper': ['freshly ground black pepper', 'ground black pepper']
    };

    const synonymMap = new Map();
    
    // Build bidirectional synonym map
    for (const [base, synonyms] of Object.entries(synonymData)) {
      synonymMap.set(base, synonyms);
      
      // Add reverse mappings
      for (const synonym of synonyms) {
        if (!synonymMap.has(synonym)) {
          synonymMap.set(synonym, [base, ...synonyms.filter(s => s !== synonym)]);
        }
      }
    }
    
    return synonymMap;
  }
}

// Export singleton instance
export default new IngredientSimilarityService();