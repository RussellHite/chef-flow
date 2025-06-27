/**
 * Embedded Ingredient Database
 * 
 * Translation-ready structure with language keys
 * Optimized for fast search and lookup operations
 * Future-ready for server migration
 */

// Ingredient Categories
export const CATEGORIES = {
  vegetables: { id: 'vegetables', nameKey: 'category.vegetables', name: 'Vegetables' },
  fruits: { id: 'fruits', nameKey: 'category.fruits', name: 'Fruits' },
  proteins: { id: 'proteins', nameKey: 'category.proteins', name: 'Proteins' },
  dairy: { id: 'dairy', nameKey: 'category.dairy', name: 'Dairy' },
  grains: { id: 'grains', nameKey: 'category.grains', name: 'Grains' },
  spices: { id: 'spices', nameKey: 'category.spices', name: 'Spices & Herbs' },
  condiments: { id: 'condiments', nameKey: 'category.condiments', name: 'Condiments' },
  oils: { id: 'oils', nameKey: 'category.oils', name: 'Oils & Fats' },
  nuts: { id: 'nuts', nameKey: 'category.nuts', name: 'Nuts & Seeds' },
  pantry: { id: 'pantry', nameKey: 'category.pantry', name: 'Pantry Staples' }
};

// Measurement Units
export const UNITS = {
  // Volume
  cup: { id: 'cup', nameKey: 'unit.cup', name: 'cup', plural: 'cups', type: 'volume' },
  tbsp: { id: 'tbsp', nameKey: 'unit.tbsp', name: 'tbsp', plural: 'tbsp', type: 'volume' },
  tsp: { id: 'tsp', nameKey: 'unit.tsp', name: 'tsp', plural: 'tsp', type: 'volume' },
  ml: { id: 'ml', nameKey: 'unit.ml', name: 'ml', plural: 'ml', type: 'volume' },
  liter: { id: 'liter', nameKey: 'unit.liter', name: 'liter', plural: 'liters', type: 'volume' },
  
  // Weight
  oz: { id: 'oz', nameKey: 'unit.oz', name: 'oz', plural: 'oz', type: 'weight' },
  lb: { id: 'lb', nameKey: 'unit.lb', name: 'lb', plural: 'lbs', type: 'weight' },
  gram: { id: 'gram', nameKey: 'unit.gram', name: 'gram', plural: 'grams', type: 'weight' },
  kg: { id: 'kg', nameKey: 'unit.kg', name: 'kg', plural: 'kg', type: 'weight' },
  
  // Count
  piece: { id: 'piece', nameKey: 'unit.piece', name: 'piece', plural: 'pieces', type: 'count' },
  whole: { id: 'whole', nameKey: 'unit.whole', name: 'whole', plural: 'whole', type: 'count' },
  clove: { id: 'clove', nameKey: 'unit.clove', name: 'clove', plural: 'cloves', type: 'count' },
  sprig: { id: 'sprig', nameKey: 'unit.sprig', name: 'sprig', plural: 'sprigs', type: 'count' },
  pinch: { id: 'pinch', nameKey: 'unit.pinch', name: 'pinch', plural: 'pinches', type: 'count' },
  
  // Size descriptors
  small: { id: 'small', nameKey: 'unit.small', name: 'small', plural: 'small', type: 'size' },
  medium: { id: 'medium', nameKey: 'unit.medium', name: 'medium', plural: 'medium', type: 'size' },
  large: { id: 'large', nameKey: 'unit.large', name: 'large', plural: 'large', type: 'size' },
  
  // Container sizes
  can: { id: 'can', nameKey: 'unit.can', name: 'can', plural: 'cans', type: 'container' },
  package: { id: 'package', nameKey: 'unit.package', name: 'package', plural: 'packages', type: 'container' },
  box: { id: 'box', nameKey: 'unit.box', name: 'box', plural: 'boxes', type: 'container' }
};

// Preparation Methods
export const PREPARATION_METHODS = {
  // Cutting methods
  chopped: { id: 'chopped', nameKey: 'prep.chopped', name: 'chopped', requiresStep: true, category: 'cutting' },
  diced: { id: 'diced', nameKey: 'prep.diced', name: 'diced', requiresStep: true, category: 'cutting' },
  sliced: { id: 'sliced', nameKey: 'prep.sliced', name: 'sliced', requiresStep: true, category: 'cutting' },
  minced: { id: 'minced', nameKey: 'prep.minced', name: 'minced', requiresStep: true, category: 'cutting' },
  julienned: { id: 'julienned', nameKey: 'prep.julienned', name: 'julienned', requiresStep: true, category: 'cutting' },
  cubed: { id: 'cubed', nameKey: 'prep.cubed', name: 'cubed', requiresStep: true, category: 'cutting' },
  halved: { id: 'halved', nameKey: 'prep.halved', name: 'halved', requiresStep: true, category: 'cutting' },
  quartered: { id: 'quartered', nameKey: 'prep.quartered', name: 'quartered', requiresStep: true, category: 'cutting' },
  
  // Processing methods
  grated: { id: 'grated', nameKey: 'prep.grated', name: 'grated', requiresStep: true, category: 'processing' },
  shredded: { id: 'shredded', nameKey: 'prep.shredded', name: 'shredded', requiresStep: true, category: 'processing' },
  peeled: { id: 'peeled', nameKey: 'prep.peeled', name: 'peeled', requiresStep: true, category: 'processing' },
  crushed: { id: 'crushed', nameKey: 'prep.crushed', name: 'crushed', requiresStep: true, category: 'processing' },
  juiced: { id: 'juiced', nameKey: 'prep.juiced', name: 'juiced', requiresStep: true, category: 'processing' },
  
  // Treatment methods
  sifted: { id: 'sifted', nameKey: 'prep.sifted', name: 'sifted', requiresStep: true, category: 'treatment' },
  drained: { id: 'drained', nameKey: 'prep.drained', name: 'drained', requiresStep: true, category: 'treatment' },
  rinsed: { id: 'rinsed', nameKey: 'prep.rinsed', name: 'rinsed', requiresStep: true, category: 'treatment' },
  
  // State descriptors (don't require steps)
  fresh: { id: 'fresh', nameKey: 'prep.fresh', name: 'fresh', requiresStep: false, category: 'state' },
  frozen: { id: 'frozen', nameKey: 'prep.frozen', name: 'frozen', requiresStep: false, category: 'state' },
  dried: { id: 'dried', nameKey: 'prep.dried', name: 'dried', requiresStep: false, category: 'state' },
  cooked: { id: 'cooked', nameKey: 'prep.cooked', name: 'cooked', requiresStep: false, category: 'state' },
  skinless: { id: 'skinless', nameKey: 'prep.skinless', name: 'skinless', requiresStep: false, category: 'state' },
  boneless: { id: 'boneless', nameKey: 'prep.boneless', name: 'boneless', requiresStep: false, category: 'state' },
  divided: { id: 'divided', nameKey: 'prep.divided', name: 'divided', requiresStep: false, category: 'state' },
  
  // Form descriptors (don't require steps)
  halves: { id: 'halves', nameKey: 'prep.halves', name: 'halves', requiresStep: false, category: 'form' },
  quarters: { id: 'quarters', nameKey: 'prep.quarters', name: 'quarters', requiresStep: false, category: 'form' },
  pieces: { id: 'pieces', nameKey: 'prep.pieces', name: 'pieces', requiresStep: false, category: 'form' },
  slices: { id: 'slices', nameKey: 'prep.slices', name: 'slices', requiresStep: false, category: 'form' }
};

// Base Ingredients Database
export const INGREDIENTS = {
  // Vegetables
  onion: {
    id: 'onion',
    nameKey: 'ingredient.onion',
    name: 'onion',
    plural: 'onions',
    category: 'vegetables',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large', 'small'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'minced', 'quartered', 'halved'],
    searchTerms: ['onion', 'onions', 'yellow onion', 'white onion']
  },
  
  garlic: {
    id: 'garlic',
    nameKey: 'ingredient.garlic',
    name: 'garlic',
    plural: 'garlic',
    category: 'vegetables',
    commonUnits: ['clove', 'tbsp', 'tsp'],
    commonPreparations: ['minced', 'chopped', 'crushed', 'whole'],
    searchTerms: ['garlic', 'garlic clove', 'garlic cloves']
  },
  
  tomato: {
    id: 'tomato',
    nameKey: 'ingredient.tomato',
    name: 'tomato',
    plural: 'tomatoes',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'can', 'medium', 'large'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'quartered', 'crushed'],
    searchTerms: ['tomato', 'tomatoes', 'fresh tomato', 'canned tomato']
  },
  
  carrot: {
    id: 'carrot',
    nameKey: 'ingredient.carrot',
    name: 'carrot',
    plural: 'carrots',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'julienned', 'grated', 'peeled'],
    searchTerms: ['carrot', 'carrots']
  },
  
  // Proteins
  chicken: {
    id: 'chicken',
    nameKey: 'ingredient.chicken',
    name: 'chicken',
    plural: 'chickens',
    category: 'proteins',
    commonUnits: ['piece', 'lb', 'oz', 'whole'],
    commonPreparations: ['whole', 'cut up', 'quartered'],
    searchTerms: ['chicken', 'whole chicken', 'chicken pieces']
  },
  
  chicken_breast: {
    id: 'chicken_breast',
    nameKey: 'ingredient.chicken_breast',
    name: 'chicken breast',
    plural: 'chicken breasts',
    category: 'proteins',
    commonUnits: ['piece', 'lb', 'oz'],
    commonPreparations: ['cubed', 'sliced', 'whole', 'skinless', 'boneless', 'halves'],
    searchTerms: ['chicken breast', 'chicken breasts', 'chicken', 'breast']
  },
  
  ground_beef: {
    id: 'ground_beef',
    nameKey: 'ingredient.ground_beef',
    name: 'ground beef',
    plural: 'ground beef',
    category: 'proteins',
    commonUnits: ['lb', 'oz'],
    commonPreparations: ['cooked', 'fresh'],
    searchTerms: ['ground beef', 'beef', 'hamburger']
  },
  
  // Dairy
  milk: {
    id: 'milk',
    nameKey: 'ingredient.milk',
    name: 'milk',
    plural: 'milk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'ml'],
    commonPreparations: ['whole', 'skim', '2%'],
    searchTerms: ['milk', 'whole milk', 'skim milk']
  },
  
  butter: {
    id: 'butter',
    nameKey: 'ingredient.butter',
    name: 'butter',
    plural: 'butter',
    category: 'dairy',
    commonUnits: ['tbsp', 'cup', 'oz'],
    commonPreparations: ['softened', 'melted', 'cold'],
    searchTerms: ['butter', 'unsalted butter', 'salted butter']
  },
  
  // Grains
  flour: {
    id: 'flour',
    nameKey: 'ingredient.flour',
    name: 'flour',
    plural: 'flour',
    category: 'grains',
    commonUnits: ['cup', 'tbsp', 'oz'],
    commonPreparations: ['sifted', 'all-purpose', 'whole wheat'],
    searchTerms: ['flour', 'all-purpose flour', 'wheat flour']
  },
  
  rice: {
    id: 'rice',
    nameKey: 'ingredient.rice',
    name: 'rice',
    plural: 'rice',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['rinsed', 'cooked', 'uncooked'],
    searchTerms: ['rice', 'white rice', 'brown rice', 'jasmine rice']
  },
  
  // Spices
  salt: {
    id: 'salt',
    nameKey: 'ingredient.salt',
    name: 'salt',
    plural: 'salt',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['kosher', 'sea salt', 'table salt'],
    searchTerms: ['salt', 'kosher salt', 'sea salt', 'table salt']
  },
  
  black_pepper: {
    id: 'black_pepper',
    nameKey: 'ingredient.black_pepper',
    name: 'black pepper',
    plural: 'black pepper',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['ground', 'freshly ground', 'whole'],
    searchTerms: ['black pepper', 'pepper', 'ground pepper']
  },
  
  parsley: {
    id: 'parsley',
    nameKey: 'ingredient.parsley',
    name: 'parsley',
    plural: 'parsley',
    category: 'spices',
    commonUnits: ['sprig', 'tbsp', 'tsp', 'cup'],
    commonPreparations: ['fresh', 'dried', 'chopped', 'minced'],
    searchTerms: ['parsley', 'fresh parsley', 'dried parsley', 'italian parsley', 'flat leaf parsley']
  },
  
  oregano: {
    id: 'oregano',
    nameKey: 'ingredient.oregano',
    name: 'oregano',
    plural: 'oregano',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['fresh', 'dried', 'crushed'],
    searchTerms: ['oregano', 'fresh oregano', 'dried oregano', 'italian oregano']
  },
  
  // Oils
  olive_oil: {
    id: 'olive_oil',
    nameKey: 'ingredient.olive_oil',
    name: 'olive oil',
    plural: 'olive oil',
    category: 'oils',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['extra virgin', 'virgin', 'light'],
    searchTerms: ['olive oil', 'extra virgin olive oil', 'evoo']
  },
  
  // Fruits
  lemon: {
    id: 'lemon',
    nameKey: 'ingredient.lemon',
    name: 'lemon',
    plural: 'lemons',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'tbsp', 'tsp', 'medium', 'large'],
    commonPreparations: ['juiced', 'zested', 'sliced', 'wedges', 'halved'],
    searchTerms: ['lemon', 'lemons', 'lemon juice', 'fresh lemon']
  },
  
  // Pantry
  sugar: {
    id: 'sugar',
    nameKey: 'ingredient.sugar',
    name: 'sugar',
    plural: 'sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
    commonPreparations: ['granulated', 'brown', 'powdered'],
    searchTerms: ['sugar', 'granulated sugar', 'white sugar', 'brown sugar']
  },
  
  vanilla_extract: {
    id: 'vanilla_extract',
    nameKey: 'ingredient.vanilla_extract',
    name: 'vanilla extract',
    plural: 'vanilla extract',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['pure', 'imitation'],
    searchTerms: ['vanilla extract', 'vanilla', 'pure vanilla']
  }
};

// Unit conversion table for suggestions
export const UNIT_CONVERSIONS = {
  // Volume conversions
  volume: {
    tsp: { tbsp: 0.333, cup: 0.0208 },
    tbsp: { tsp: 3, cup: 0.0625 },
    cup: { tbsp: 16, tsp: 48 }
  },
  
  // Weight conversions
  weight: {
    oz: { lb: 0.0625, gram: 28.35 },
    lb: { oz: 16, kg: 0.453 },
    gram: { oz: 0.035, kg: 0.001 },
    kg: { gram: 1000, lb: 2.205 }
  }
};