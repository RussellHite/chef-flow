/**
 * Test harness for quantity parsing issues
 * Tests decimal and fraction handling in preprocessing
 */

// Import the preprocessing logic
const testPreprocessing = (input) => {
  if (!input) return input;
  
  let processed = input;
  
  // Updated preprocessing logic from EmbeddedIngredientDataSource
  // Phase 1: Handle mixed fractions FIRST (e.g., "21/2cups" -> "2 1/2 cups")
  processed = processed.replace(/(\d+)(1\/\d+)/g, '$1 $2');
  
  // Phase 2: Handle quantities and parenthetical info
  processed = processed.replace(/(\d+)\s*\(/g, '$1 (');
  processed = processed.replace(/([a-zA-Z])\s*\(/g, '$1 (');
  
  // Create comprehensive unit list - ordered from longest to shortest
  const units = [
    'tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 'ounces', 'ounce', 'pounds', 'pound',
    'containers', 'container', 'packages', 'package', 'gallons', 'gallon', 'quarts', 'quart',
    'liters', 'liter', 'bottles', 'bottle', 'pieces', 'piece', 'cloves', 'clove', 'sprigs', 'sprig',
    'pinches', 'pinch', 'dashes', 'dash', 'slices', 'slice', 'grams', 'gram',
    'cups', 'cup', 'tbsp', 'tsp', 'lbs', 'lb', 'oz', 'kg', 'ml', 'cans', 'can', 'pints', 'pint',
    'boxes', 'box', 'jars', 'jar', 'whole', 'small', 'medium', 'large'
  ];
  
  // Phase 4: Apply quantity+unit separation with improved logic
  // Process each unit, looking for direct attachment to quantities
  units.forEach(unit => {
    // Create pattern that only matches when there's NO space between quantity and unit
    const pattern = new RegExp(`(\\d+(?:\\.\\d+)?(?:\\s+\\d+/\\d+)?(?:/\\d+)?)${unit}\\b`, 'gi');
    processed = processed.replace(pattern, `$1 ${unit}`);
  });
  
  // Fix missing spaces after commas
  processed = processed.replace(/,([a-zA-Z])/g, ', $1');
  
  // Normalize multiple spaces to single space
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
};

// Test cases for quantity parsing
const QUANTITY_TEST_CASES = [
  // Decimal quantities
  { input: "2.5cups flour", expected: "2.5 cups flour", description: "Decimal quantity with unit" },
  { input: "2.5cupflour", expected: "2.5 cup flour", description: "Decimal quantity without spaces" },
  { input: "1.5tbsp sugar", expected: "1.5 tbsp sugar", description: "Decimal with abbreviation" },
  { input: "0.5oz vanilla", expected: "0.5 oz vanilla", description: "Decimal less than 1" },
  
  // Mixed fractions (should become 2 1/2)
  { input: "21/2cups flour", expected: "2 1/2 cups flour", description: "Mixed fraction without space" },
  { input: "2 1/2cups flour", expected: "2 1/2 cups flour", description: "Mixed fraction with space" },
  { input: "11/4cup sugar", expected: "1 1/4 cup sugar", description: "Mixed fraction 1 1/4" },
  { input: "31/3tbsp oil", expected: "3 1/3 tbsp oil", description: "Mixed fraction 3 1/3" },
  
  // Simple fractions
  { input: "1/2cup milk", expected: "1/2 cup milk", description: "Simple fraction" },
  { input: "1/3cup honey", expected: "1/3 cup honey", description: "Simple fraction 1/3" },
  { input: "3/4tsp salt", expected: "3/4 tsp salt", description: "Simple fraction 3/4" },
  
  // Edge cases
  { input: "2cups flour", expected: "2 cups flour", description: "Whole number" },
  { input: "10cups water", expected: "10 cups water", description: "Two digit number" },
  { input: "2.25cups flour", expected: "2.25 cups flour", description: "Decimal with multiple places" },
];

// Run tests
console.log('🧪 Testing Quantity Parsing Issues');
console.log('=' .repeat(50));
console.log('');

let passedTests = 0;
let totalTests = QUANTITY_TEST_CASES.length;

QUANTITY_TEST_CASES.forEach(testCase => {
  const result = testPreprocessing(testCase.input);
  const passed = result === testCase.expected;
  const status = passed ? "✅ PASS" : "❌ FAIL";
  
  console.log(`${status} ${testCase.description}`);
  console.log(`  Input:    "${testCase.input}"`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Got:      "${result}"`);
  
  if (!passed) {
    console.log(`  ❌ Mismatch detected!`);
  }
  console.log('');
  
  if (passed) passedTests++;
});

// Summary
console.log('📊 Test Results Summary:');
console.log(`  Total tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${totalTests - passedTests}`);
console.log(`  Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

// Specific problem analysis
console.log('');
console.log('🔍 Problem Analysis:');
console.log('The issue is that the preprocessing is adding spaces inside quantity values:');
console.log('- "2.5cups" is being parsed correctly');
console.log('- "21/2cups" should be recognized as "2 1/2 cups" (mixed fraction)');
console.log('- The regex pattern needs to handle mixed fractions better');