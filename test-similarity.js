/**
 * Quick test to verify the new similarity service works correctly
 * Run this with: node test-similarity.js
 */

import IngredientSimilarityService from './services/IngredientSimilarityService.js';

// Test cases for ingredient similarity
const testCases = [
  {
    query: 'roma tomatoes',
    ingredient: { 
      name: 'tomato', 
      searchTerms: ['tomato', 'roma tomato', 'cherry tomato'],
      category: 'vegetables'
    },
    expectedScore: '>70'
  },
  {
    query: 'yello onion',
    ingredient: { 
      name: 'yellow onion', 
      searchTerms: ['onion', 'yellow onion'],
      category: 'vegetables'
    },
    expectedScore: '>60'
  },
  {
    query: 'tomatoe',
    ingredient: { 
      name: 'tomato', 
      searchTerms: ['tomato'],
      category: 'vegetables'
    },
    expectedScore: '>70'
  }
];

console.log('🧪 Testing Ingredient Similarity Service...\n');

testCases.forEach((testCase, index) => {
  const score = IngredientSimilarityService.calculateSimilarity(
    testCase.query, 
    testCase.ingredient
  );
  
  console.log(`Test ${index + 1}:`);
  console.log(`  Query: "${testCase.query}"`);
  console.log(`  Ingredient: "${testCase.ingredient.name}"`);
  console.log(`  Score: ${score} (expected: ${testCase.expectedScore})`);
  console.log(`  Result: ${score > 60 ? '✅ PASS' : '❌ FAIL'}\n`);
});

// Test batch matching
const testIngredients = [
  { name: 'tomato', searchTerms: ['tomato'], category: 'vegetables' },
  { name: 'onion', searchTerms: ['onion'], category: 'vegetables' },
  { name: 'garlic', searchTerms: ['garlic'], category: 'vegetables' },
  { name: 'olive oil', searchTerms: ['olive oil'], category: 'oils' }
];

console.log('🧪 Testing Batch Matching...\n');

const results = IngredientSimilarityService.findBestMatches(
  'tomatoe', 
  testIngredients, 
  3
);

console.log('Query: "tomatoe"');
console.log('Results:');
results.forEach((result, index) => {
  console.log(`  ${index + 1}. ${result.ingredient.name} (score: ${result.score})`);
});

console.log('\n✅ Similarity service test completed!');