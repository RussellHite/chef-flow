/**
 * Simple Tokenizer for all-MiniLM-L6-v2
 * 
 * A basic BERT-style tokenizer implementation for the all-MiniLM-L6-v2 model
 * This is a simplified version that handles the most common tokenization patterns
 */

class SimpleTokenizer {
  constructor() {
    this.vocabSize = 30522; // BERT vocab size
    this.maxLength = 512;
    this.padTokenId = 0;
    this.clsTokenId = 101;
    this.sepTokenId = 102;
    this.unkTokenId = 100;
    
    // Basic vocabulary mapping (this would normally be loaded from vocab.txt)
    this.vocab = this.createBasicVocab();
    this.idsToTokens = new Map();
    
    // Create reverse mapping
    for (const [token, id] of this.vocab.entries()) {
      this.idsToTokens.set(id, token);
    }
  }

  createBasicVocab() {
    const vocab = new Map();
    
    // Special tokens
    vocab.set('[PAD]', 0);
    vocab.set('[UNK]', 100);
    vocab.set('[CLS]', 101);
    vocab.set('[SEP]', 102);
    vocab.set('[MASK]', 103);
    
    // Common punctuation and symbols
    let id = 999; // Start after reserved tokens
    const commonTokens = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'were', 'will', 'with', 'the', 'this', 'these', 'those',
      'i', 'you', 'we', 'they', 'she', 'her', 'his', 'him', 'us', 'them',
      'can', 'could', 'would', 'should', 'may', 'might', 'must', 'shall',
      'have', 'had', 'has', 'do', 'does', 'did', 'get', 'got', 'go', 'went',
      'come', 'came', 'see', 'saw', 'know', 'knew', 'take', 'took', 'make', 'made',
      '.', ',', '!', '?', ';', ':', '-', '(', ')', '[', ']', '{', '}', '"', "'",
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      // Food-related tokens
      'food', 'ingredient', 'recipe', 'cook', 'cooking', 'bake', 'baking',
      'eat', 'meal', 'dish', 'serve', 'serving', 'cup', 'cups', 'tablespoon',
      'teaspoon', 'pound', 'ounce', 'gram', 'kilogram', 'liter', 'milliliter',
      'fresh', 'dried', 'frozen', 'chopped', 'diced', 'sliced', 'minced',
      'salt', 'pepper', 'oil', 'butter', 'milk', 'egg', 'flour', 'sugar',
      'water', 'onion', 'garlic', 'tomato', 'chicken', 'beef', 'pork', 'fish'
    ];
    
    for (const token of commonTokens) {
      if (!vocab.has(token)) {
        vocab.set(token, id++);
      }
    }
    
    return vocab;
  }

  /**
   * Basic word tokenization with subword handling
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Basic normalization
    text = text.toLowerCase().trim();
    
    // Split on whitespace and punctuation
    const words = text.split(/[\s\-_.,!?;:()\[\]{}'"]+/).filter(w => w.length > 0);
    
    const tokens = [];
    for (const word of words) {
      // Try exact match first
      if (this.vocab.has(word)) {
        tokens.push(word);
      } else {
        // Simple subword tokenization - split into characters if word not found
        const subwords = this.simpleSubwordTokenization(word);
        tokens.push(...subwords);
      }
    }
    
    return tokens;
  }

  /**
   * Simple subword tokenization for unknown words
   */
  simpleSubwordTokenization(word) {
    const tokens = [];
    let start = 0;
    
    while (start < word.length) {
      let found = false;
      
      // Try to find the longest substring that exists in vocab
      for (let end = word.length; end > start; end--) {
        const substring = start === 0 ? word.slice(start, end) : `##${word.slice(start, end)}`;
        if (this.vocab.has(substring)) {
          tokens.push(substring);
          start = end;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // If no substring found, use single character
        const char = start === 0 ? word[start] : `##${word[start]}`;
        tokens.push(this.vocab.has(char) ? char : '[UNK]');
        start++;
      }
    }
    
    return tokens;
  }

  /**
   * Convert tokens to IDs
   */
  convertTokensToIds(tokens) {
    return tokens.map(token => this.vocab.get(token) || this.unkTokenId);
  }

  /**
   * Encode text to input IDs with proper formatting for BERT
   */
  encode(text, maxLength = this.maxLength) {
    const tokens = this.tokenize(text);
    const tokenIds = this.convertTokensToIds(tokens);
    
    // Add [CLS] and [SEP] tokens
    const inputIds = [this.clsTokenId, ...tokenIds, this.sepTokenId];
    
    // Truncate if too long
    if (inputIds.length > maxLength) {
      inputIds.splice(maxLength - 1, inputIds.length - maxLength);
      inputIds[maxLength - 1] = this.sepTokenId; // Ensure [SEP] at end
    }
    
    // Pad to maxLength
    const attentionMask = new Array(inputIds.length).fill(1);
    while (inputIds.length < maxLength) {
      inputIds.push(this.padTokenId);
      attentionMask.push(0);
    }
    
    return {
      input_ids: inputIds,
      attention_mask: attentionMask,
      token_type_ids: new Array(maxLength).fill(0) // All zeros for single sentence
    };
  }

  /**
   * Decode token IDs back to text
   */
  decode(tokenIds) {
    const tokens = tokenIds
      .map(id => this.idsToTokens.get(id) || '[UNK]')
      .filter(token => !['[PAD]', '[CLS]', '[SEP]'].includes(token));
    
    return tokens.join(' ').replace(/##/g, '');
  }
}

export default SimpleTokenizer;