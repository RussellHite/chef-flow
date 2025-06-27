// Analysis of training data to improve ingredient database

const trainingData = {
  "exportDate": "2025-06-27T16:50:25.855Z",
  "version": "1.0",
  "data": [
    {
      "id": 1750707829471,
      "originalText": "2 sprigs fresh parsley, chopped, for garnish",
      "manualParsing": {
        "quantity": "2",
        "unit": "sprigs",
        "ingredient": "parsley",
        "description": "fresh for garnish",
        "action": "chopped",
        "parts": [
          {
            "text": "2",
            "type": "quantity"
          },
          {
            "text": "sprigs",
            "type": "unit"
          },
          {
            "text": "fresh",
            "type": "description"
          },
          {
            "text": "parsley",
            "type": "ingredient"
          },
          {
            "text": "chopped",
            "type": "action"
          },
          {
            "text": "for",
            "type": "description"
          },
          {
            "text": "garnish",
            "type": "description"
          }
        ],
        "structured": {
          "quantity": 2,
          "unit": {
            "value": "sprigs",
            "name": "sprigs",
            "plural": "sprigs"
          },
          "ingredient": {
            "id": "trained",
            "name": "parsley",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "fresh for garnish",
            "requiresStep": true
          },
          "originalText": "2 sprigs parsley, fresh for garnish",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:43:49.471Z"
    },
    {
      "id": 1750707861065,
      "originalText": "1 pinch dried oregano",
      "manualParsing": {
        "quantity": "1",
        "unit": "pinch",
        "ingredient": "oregano",
        "description": "dried",
        "action": null,
        "parts": [
          {
            "text": "1",
            "type": "quantity"
          },
          {
            "text": "pinch",
            "type": "unit"
          },
          {
            "text": "dried",
            "type": "description"
          },
          {
            "text": "oregano",
            "type": "ingredient"
          }
        ],
        "structured": {
          "quantity": 1,
          "unit": {
            "value": "pinch",
            "name": "pinch",
            "plural": "pinchs"
          },
          "ingredient": {
            "id": "trained",
            "name": "oregano",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "dried",
            "requiresStep": true
          },
          "originalText": "1 pinch oregano, dried",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:44:21.065Z"
    },
    {
      "id": 1750707919178,
      "originalText": "2 tsp undefined oregano, dried",
      "manualParsing": {
        "quantity": "2",
        "unit": "tsp",
        "ingredient": "oregano",
        "description": "undefined dried",
        "action": null,
        "parts": [
          {
            "text": "2",
            "type": "quantity"
          },
          {
            "text": "tsp",
            "type": "unit"
          },
          {
            "text": "undefined",
            "type": "description"
          },
          {
            "text": "oregano",
            "type": "ingredient"
          },
          {
            "text": "dried",
            "type": "description"
          }
        ],
        "structured": {
          "quantity": 2,
          "unit": {
            "value": "tsp",
            "label": "tsp",
            "plural": "tsp"
          },
          "ingredient": {
            "id": "trained",
            "name": "oregano",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "undefined dried",
            "requiresStep": true
          },
          "originalText": "2 tsp oregano, undefined dried",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:45:19.178Z"
    },
    {
      "id": 1750707986549,
      "originalText": "2 cups olive oil",
      "manualParsing": {
        "quantity": "2",
        "unit": "cups",
        "ingredient": "olive oil",
        "description": null,
        "action": null,
        "parts": [
          {
            "text": "2",
            "type": "quantity"
          },
          {
            "text": "cups",
            "type": "unit"
          },
          {
            "text": "olive",
            "type": "ingredient"
          },
          {
            "text": "oil",
            "type": "ingredient"
          }
        ],
        "structured": {
          "quantity": 2,
          "unit": {
            "value": "cup",
            "label": "cup",
            "plural": "cups"
          },
          "ingredient": {
            "id": "trained",
            "name": "olive oil",
            "category": "custom"
          },
          "preparation": null,
          "originalText": "2 cups olive oil",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:46:26.549Z"
    },
    {
      "id": 1750708072181,
      "originalText": "1 pinch dried oregano",
      "manualParsing": {
        "quantity": "1",
        "unit": "pinch",
        "ingredient": "oregano",
        "description": "dried",
        "action": null,
        "parts": [
          {
            "text": "1",
            "type": "quantity"
          },
          {
            "text": "pinch",
            "type": "unit"
          },
          {
            "text": "dried",
            "type": "description"
          },
          {
            "text": "oregano",
            "type": "ingredient"
          }
        ],
        "structured": {
          "quantity": 1,
          "unit": {
            "value": "pinch",
            "name": "pinch",
            "plural": "pinchs"
          },
          "ingredient": {
            "id": "trained",
            "name": "oregano",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "dried",
            "requiresStep": true
          },
          "originalText": "1 pinch oregano, dried",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:47:52.181Z"
    },
    {
      "id": 1750708110587,
      "originalText": "1 medium lemon, juiced, divided",
      "manualParsing": {
        "quantity": "1",
        "unit": null,
        "ingredient": "lemon",
        "description": "medium divided",
        "action": "juiced",
        "parts": [
          {
            "text": "1",
            "type": "quantity"
          },
          {
            "text": "medium",
            "type": "description"
          },
          {
            "text": "lemon",
            "type": "ingredient"
          },
          {
            "text": "juiced",
            "type": "action"
          },
          {
            "text": "divided",
            "type": "description"
          }
        ],
        "structured": {
          "quantity": 1,
          "unit": null,
          "ingredient": {
            "id": "trained",
            "name": "lemon",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "medium divided",
            "requiresStep": true
          },
          "originalText": "1 lemon, medium divided",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-23T19:48:30.587Z"
    },
    {
      "id": 1751042879224,
      "originalText": "2 (5 ounce) skinless, boneless chicken breast halves",
      "manualParsing": {
        "quantity": "2",
        "unit": "(5 ounce)",
        "ingredient": "chicken breast",
        "description": "skinless boneless halves",
        "action": null,
        "parts": [
          {
            "text": "2",
            "type": "quantity"
          },
          {
            "text": "(5",
            "type": "unit"
          },
          {
            "text": "ounce)",
            "type": "unit"
          },
          {
            "text": "skinless",
            "type": "description"
          },
          {
            "text": "boneless",
            "type": "description"
          },
          {
            "text": "chicken",
            "type": "ingredient"
          },
          {
            "text": "breast",
            "type": "ingredient"
          },
          {
            "text": "halves",
            "type": "description"
          }
        ],
        "structured": {
          "quantity": 2,
          "unit": {
            "value": "(5 ounce)",
            "name": "(5 ounce)",
            "plural": "(5 ounce)s"
          },
          "ingredient": {
            "id": "trained",
            "name": "chicken breast",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "skinless boneless halves",
            "requiresStep": true
          },
          "originalText": "2 (5 ounce) chicken breast, skinless boneless halves",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-27T16:47:59.224Z"
    },
    {
      "id": 1751042915222,
      "originalText": "2 sprigs fresh parsley, chopped, for garnish",
      "manualParsing": {
        "quantity": "2",
        "unit": "sprigs",
        "ingredient": "parsley",
        "description": "fresh for garnish",
        "action": "chopped",
        "parts": [
          {
            "text": "2",
            "type": "quantity"
          },
          {
            "text": "sprigs",
            "type": "unit"
          },
          {
            "text": "fresh",
            "type": "description"
          },
          {
            "text": "parsley",
            "type": "ingredient"
          },
          {
            "text": "chopped",
            "type": "action"
          },
          {
            "text": "for",
            "type": "description"
          },
          {
            "text": "garnish",
            "type": "description"
          }
        ],
        "structured": {
          "quantity": 2,
          "unit": {
            "value": "sprigs",
            "name": "sprigs",
            "plural": "sprigs"
          },
          "ingredient": {
            "id": "trained",
            "name": "parsley",
            "category": "custom"
          },
          "preparation": {
            "id": "trained",
            "name": "fresh for garnish",
            "requiresStep": true
          },
          "originalText": "2 sprigs parsley, fresh for garnish",
          "isStructured": true
        }
      },
      "timestamp": "2025-06-27T16:48:35.222Z"
    }
  ]
};

// Analyze the data
console.log('📊 Training Data Analysis\n');

// Extract unique ingredients
const ingredients = new Map();
const units = new Map();
const preparations = new Set();
const actions = new Set();

trainingData.data.forEach(item => {
  // Count ingredients
  const ingredientName = item.manualParsing.ingredient;
  if (ingredientName) {
    ingredients.set(ingredientName, (ingredients.get(ingredientName) || 0) + 1);
  }
  
  // Count units
  const unit = item.manualParsing.unit;
  if (unit) {
    units.set(unit, (units.get(unit) || 0) + 1);
  }
  
  // Collect preparations
  if (item.manualParsing.description) {
    preparations.add(item.manualParsing.description);
  }
  
  // Collect actions
  if (item.manualParsing.action) {
    actions.add(item.manualParsing.action);
  }
});

console.log('🥗 Unique Ingredients Found:');
[...ingredients.entries()].sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log(`  - ${name} (${count} occurrences)`);
});

console.log('\n📏 Units Used:');
[...units.entries()].sort((a, b) => b[1] - a[1]).forEach(([unit, count]) => {
  console.log(`  - ${unit} (${count} times)`);
});

console.log('\n🔪 Actions:');
[...actions].forEach(action => {
  console.log(`  - ${action}`);
});

console.log('\n📝 Preparation Descriptions:');
[...preparations].forEach(prep => {
  console.log(`  - ${prep}`);
});

// Identify patterns
console.log('\n🔍 Patterns Identified:');

// Check for compound ingredients
const compoundIngredients = trainingData.data.filter(item => 
  item.manualParsing.parts.filter(p => p.type === 'ingredient').length > 1
);
console.log(`  - Compound ingredients: ${compoundIngredients.length} (e.g., "olive oil", "chicken breast")`);

// Check for parenthetical quantities
const parentheticalQuantities = trainingData.data.filter(item => 
  item.originalText.includes('(') && item.originalText.includes('ounce')
);
console.log(`  - Parenthetical quantities: ${parentheticalQuantities.length} (e.g., "2 (5 ounce) chicken breast")`);

// Check for action words that should create steps
const actionIngredients = trainingData.data.filter(item => item.manualParsing.action);
console.log(`  - Ingredients with actions: ${actionIngredients.length} (should create steps)`);

// Check for "divided" ingredients
const dividedIngredients = trainingData.data.filter(item => 
  item.manualParsing.description && item.manualParsing.description.includes('divided')
);
console.log(`  - Divided ingredients: ${dividedIngredients.length}`);

// Missing from current database that should be added
console.log('\n🆕 Ingredients to Add to Database:');
const missingIngredients = ['parsley', 'oregano', 'olive oil', 'lemon', 'chicken breast'];
missingIngredients.forEach(ing => {
  console.log(`  - ${ing}`);
});

// Suggest database structure improvements
console.log('\n💡 Database Structure Suggestions:');
console.log('  1. Add "herbs" category for parsley, oregano');
console.log('  2. Add "oils" category for olive oil');
console.log('  3. Add "citrus" category for lemon');
console.log('  4. Add "poultry" category for chicken breast');
console.log('  5. Support compound names (olive oil, chicken breast)');
console.log('  6. Add common preparations: fresh, dried, skinless, boneless');
console.log('  7. Support parenthetical sizing: (5 ounce)');

// Export findings for database update
const findings = {
  ingredientsToAdd: [
    { name: 'parsley', category: 'herbs', plural: 'parsley' },
    { name: 'oregano', category: 'herbs', plural: 'oregano' },
    { name: 'olive oil', category: 'oils', plural: 'olive oil' },
    { name: 'lemon', category: 'citrus', plural: 'lemons' },
    { name: 'chicken breast', category: 'poultry', plural: 'chicken breasts' },
    { name: 'chicken', category: 'poultry', plural: 'chickens' }
  ],
  unitsToVerify: ['sprigs', 'pinch'],
  commonPreparations: ['fresh', 'dried', 'skinless', 'boneless', 'for garnish', 'divided', 'medium'],
  commonActions: ['chopped', 'juiced']
};

console.log('\n📋 Export for Database Update:');
console.log(JSON.stringify(findings, null, 2));