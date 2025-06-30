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

  zucchini: {
    id: 'zucchini',
    nameKey: 'ingredient.zucchini',
    name: 'zucchini',
    plural: 'zucchini',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['sliced', 'diced', 'grated', 'julienned', 'chopped'],
    searchTerms: ['zucchini', 'courgette', 'summer squash']
  },

  broccoli: {
    id: 'broccoli',
    nameKey: 'ingredient.broccoli',
    name: 'broccoli',
    plural: 'broccoli',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'lb', 'oz'],
    commonPreparations: ['chopped', 'florets', 'fresh', 'frozen'],
    searchTerms: ['broccoli', 'broccoli florets', 'fresh broccoli']
  },

  spinach: {
    id: 'spinach',
    nameKey: 'ingredient.spinach',
    name: 'spinach',
    plural: 'spinach',
    category: 'vegetables',
    commonUnits: ['cup', 'oz', 'lb', 'package'],
    commonPreparations: ['fresh', 'frozen', 'chopped', 'whole leaves'],
    searchTerms: ['spinach', 'baby spinach', 'fresh spinach', 'frozen spinach']
  },

  potato: {
    id: 'potato',
    nameKey: 'ingredient.potato',
    name: 'potato',
    plural: 'potatoes',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'lb', 'medium', 'large'],
    commonPreparations: ['diced', 'cubed', 'sliced', 'mashed', 'peeled'],
    searchTerms: ['potato', 'potatoes', 'russet potato', 'red potato']
  },

  sweet_potato: {
    id: 'sweet_potato',
    nameKey: 'ingredient.sweet_potato',
    name: 'sweet potato',
    plural: 'sweet potatoes',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'lb', 'medium', 'large'],
    commonPreparations: ['diced', 'cubed', 'sliced', 'mashed', 'peeled'],
    searchTerms: ['sweet potato', 'sweet potatoes', 'yam']
  },

  bell_pepper: {
    id: 'bell_pepper',
    nameKey: 'ingredient.bell_pepper',
    name: 'bell pepper',
    plural: 'bell peppers',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'strips'],
    searchTerms: ['bell pepper', 'bell peppers', 'red pepper', 'green pepper', 'yellow pepper']
  },

  eggplant: {
    id: 'eggplant',
    nameKey: 'ingredient.eggplant',
    name: 'eggplant',
    plural: 'eggplants',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['sliced', 'diced', 'cubed', 'peeled'],
    searchTerms: ['eggplant', 'eggplants', 'aubergine']
  },

  mushroom: {
    id: 'mushroom',
    nameKey: 'ingredient.mushroom',
    name: 'mushroom',
    plural: 'mushrooms',
    category: 'vegetables',
    commonUnits: ['cup', 'oz', 'lb', 'piece'],
    commonPreparations: ['sliced', 'chopped', 'whole', 'quartered'],
    searchTerms: ['mushroom', 'mushrooms', 'button mushroom', 'cremini', 'shiitake']
  },

  cabbage: {
    id: 'cabbage',
    nameKey: 'ingredient.cabbage',
    name: 'cabbage',
    plural: 'cabbages',
    category: 'vegetables',
    commonUnits: ['cup', 'piece', 'lb'],
    commonPreparations: ['chopped', 'shredded', 'quartered', 'whole'],
    searchTerms: ['cabbage', 'green cabbage', 'red cabbage']
  },

  kale: {
    id: 'kale',
    nameKey: 'ingredient.kale',
    name: 'kale',
    plural: 'kale',
    category: 'vegetables',
    commonUnits: ['cup', 'oz', 'lb'],
    commonPreparations: ['chopped', 'fresh', 'stems removed'],
    searchTerms: ['kale', 'baby kale', 'curly kale']
  },

  corn: {
    id: 'corn',
    nameKey: 'ingredient.corn',
    name: 'corn',
    plural: 'corn',
    category: 'vegetables',
    commonUnits: ['cup', 'can', 'piece'],
    commonPreparations: ['kernels', 'fresh', 'frozen', 'canned'],
    searchTerms: ['corn', 'corn kernels', 'sweet corn', 'fresh corn']
  },

  celery: {
    id: 'celery',
    nameKey: 'ingredient.celery',
    name: 'celery',
    plural: 'celery',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'stalk'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'stalks'],
    searchTerms: ['celery', 'celery stalk', 'celery stalks']
  },

  cucumber: {
    id: 'cucumber',
    nameKey: 'ingredient.cucumber',
    name: 'cucumber',
    plural: 'cucumbers',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['sliced', 'diced', 'chopped', 'peeled'],
    searchTerms: ['cucumber', 'cucumbers', 'english cucumber']
  },

  lettuce: {
    id: 'lettuce',
    nameKey: 'ingredient.lettuce',
    name: 'lettuce',
    plural: 'lettuce',
    category: 'vegetables',
    commonUnits: ['cup', 'piece', 'head'],
    commonPreparations: ['chopped', 'shredded', 'leaves', 'fresh'],
    searchTerms: ['lettuce', 'iceberg lettuce', 'romaine lettuce', 'butter lettuce']
  },

  avocado: {
    id: 'avocado',
    nameKey: 'ingredient.avocado',
    name: 'avocado',
    plural: 'avocados',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium', 'large'],
    commonPreparations: ['sliced', 'diced', 'mashed', 'halved'],
    searchTerms: ['avocado', 'avocados', 'ripe avocado']
  },

  beet: {
    id: 'beet',
    nameKey: 'ingredient.beet',
    name: 'beet',
    plural: 'beets',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium'],
    commonPreparations: ['sliced', 'diced', 'grated', 'peeled', 'roasted'],
    searchTerms: ['beet', 'beets', 'beetroot', 'red beet']
  },

  cauliflower: {
    id: 'cauliflower',
    nameKey: 'ingredient.cauliflower',
    name: 'cauliflower',
    plural: 'cauliflower',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'head'],
    commonPreparations: ['florets', 'chopped', 'fresh', 'frozen'],
    searchTerms: ['cauliflower', 'cauliflower florets']
  },

  asparagus: {
    id: 'asparagus',
    nameKey: 'ingredient.asparagus',
    name: 'asparagus',
    plural: 'asparagus',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'lb', 'spear'],
    commonPreparations: ['spears', 'chopped', 'fresh', 'trimmed'],
    searchTerms: ['asparagus', 'asparagus spears', 'fresh asparagus']
  },

  green_beans: {
    id: 'green_beans',
    nameKey: 'ingredient.green_beans',
    name: 'green beans',
    plural: 'green beans',
    category: 'vegetables',
    commonUnits: ['cup', 'lb', 'oz'],
    commonPreparations: ['fresh', 'frozen', 'trimmed', 'whole'],
    searchTerms: ['green beans', 'string beans', 'fresh green beans']
  },

  peas: {
    id: 'peas',
    nameKey: 'ingredient.peas',
    name: 'peas',
    plural: 'peas',
    category: 'vegetables',
    commonUnits: ['cup', 'oz', 'can'],
    commonPreparations: ['fresh', 'frozen', 'canned'],
    searchTerms: ['peas', 'green peas', 'fresh peas', 'frozen peas']
  },

  parsnip: {
    id: 'parsnip',
    nameKey: 'ingredient.parsnip',
    name: 'parsnip',
    plural: 'parsnips',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'peeled'],
    searchTerms: ['parsnip', 'parsnips']
  },

  turnip: {
    id: 'turnip',
    nameKey: 'ingredient.turnip',
    name: 'turnip',
    plural: 'turnips',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'medium'],
    commonPreparations: ['chopped', 'diced', 'sliced', 'peeled'],
    searchTerms: ['turnip', 'turnips']
  },

  radish: {
    id: 'radish',
    nameKey: 'ingredient.radish',
    name: 'radish',
    plural: 'radishes',
    category: 'vegetables',
    commonUnits: ['piece', 'cup', 'small'],
    commonPreparations: ['sliced', 'chopped', 'whole', 'trimmed'],
    searchTerms: ['radish', 'radishes', 'red radish']
  },

  brussels_sprouts: {
    id: 'brussels_sprouts',
    nameKey: 'ingredient.brussels_sprouts',
    name: 'Brussels sprouts',
    plural: 'Brussels sprouts',
    category: 'vegetables',
    commonUnits: ['cup', 'lb', 'piece'],
    commonPreparations: ['halved', 'quartered', 'whole', 'shredded'],
    searchTerms: ['Brussels sprouts', 'brussels sprouts', 'brussel sprouts']
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

  beef: {
    id: 'beef',
    nameKey: 'ingredient.beef',
    name: 'beef',
    plural: 'beef',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['cubed', 'sliced', 'whole', 'trimmed'],
    searchTerms: ['beef', 'beef steak', 'beef roast', 'steak']
  },

  pork: {
    id: 'pork',
    nameKey: 'ingredient.pork',
    name: 'pork',
    plural: 'pork',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['cubed', 'sliced', 'whole', 'trimmed'],
    searchTerms: ['pork', 'pork chops', 'pork roast', 'pork shoulder']
  },

  lamb: {
    id: 'lamb',
    nameKey: 'ingredient.lamb',
    name: 'lamb',
    plural: 'lamb',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['cubed', 'sliced', 'whole', 'trimmed'],
    searchTerms: ['lamb', 'leg of lamb', 'lamb chops', 'lamb shoulder']
  },

  turkey: {
    id: 'turkey',
    nameKey: 'ingredient.turkey',
    name: 'turkey',
    plural: 'turkeys',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['sliced', 'cubed', 'whole', 'ground'],
    searchTerms: ['turkey', 'turkey breast', 'ground turkey', 'whole turkey']
  },

  duck: {
    id: 'duck',
    nameKey: 'ingredient.duck',
    name: 'duck',
    plural: 'ducks',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece', 'whole'],
    commonPreparations: ['whole', 'breast', 'legs', 'quartered'],
    searchTerms: ['duck', 'duck breast', 'whole duck', 'duck legs']
  },

  veal: {
    id: 'veal',
    nameKey: 'ingredient.veal',
    name: 'veal',
    plural: 'veal',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['cutlets', 'cubed', 'sliced', 'whole'],
    searchTerms: ['veal', 'veal cutlets', 'veal chops']
  },

  bacon: {
    id: 'bacon',
    nameKey: 'ingredient.bacon',
    name: 'bacon',
    plural: 'bacon',
    category: 'proteins',
    commonUnits: ['piece', 'slice', 'lb', 'oz'],
    commonPreparations: ['sliced', 'diced', 'chopped', 'cooked'],
    searchTerms: ['bacon', 'bacon strips', 'thick cut bacon']
  },

  ham: {
    id: 'ham',
    nameKey: 'ingredient.ham',
    name: 'ham',
    plural: 'hams',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'slice', 'cup'],
    commonPreparations: ['sliced', 'diced', 'cubed', 'whole'],
    searchTerms: ['ham', 'sliced ham', 'ham steak', 'deli ham']
  },

  sausage: {
    id: 'sausage',
    nameKey: 'ingredient.sausage',
    name: 'sausage',
    plural: 'sausages',
    category: 'proteins',
    commonUnits: ['piece', 'lb', 'oz'],
    commonPreparations: ['sliced', 'whole', 'casings removed'],
    searchTerms: ['sausage', 'italian sausage', 'breakfast sausage', 'bratwurst']
  },

  salmon: {
    id: 'salmon',
    nameKey: 'ingredient.salmon',
    name: 'salmon',
    plural: 'salmon',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece', 'fillet'],
    commonPreparations: ['fillet', 'steaks', 'whole', 'skinless'],
    searchTerms: ['salmon', 'salmon fillet', 'fresh salmon', 'salmon steak']
  },

  tuna: {
    id: 'tuna',
    nameKey: 'ingredient.tuna',
    name: 'tuna',
    plural: 'tuna',
    category: 'proteins',
    commonUnits: ['can', 'oz', 'lb', 'piece'],
    commonPreparations: ['canned', 'fresh', 'steaks', 'drained'],
    searchTerms: ['tuna', 'canned tuna', 'tuna steak', 'fresh tuna']
  },

  cod: {
    id: 'cod',
    nameKey: 'ingredient.cod',
    name: 'cod',
    plural: 'cod',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece', 'fillet'],
    commonPreparations: ['fillet', 'steaks', 'whole', 'skinless'],
    searchTerms: ['cod', 'cod fillet', 'fresh cod', 'white fish']
  },

  shrimp: {
    id: 'shrimp',
    nameKey: 'ingredient.shrimp',
    name: 'shrimp',
    plural: 'shrimp',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['peeled', 'deveined', 'cooked', 'fresh', 'frozen'],
    searchTerms: ['shrimp', 'prawns', 'jumbo shrimp', 'medium shrimp']
  },

  crab: {
    id: 'crab',
    nameKey: 'ingredient.crab',
    name: 'crab',
    plural: 'crabs',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'can', 'cup'],
    commonPreparations: ['meat', 'whole', 'canned', 'fresh'],
    searchTerms: ['crab', 'crab meat', 'blue crab', 'dungeness crab']
  },

  lobster: {
    id: 'lobster',
    nameKey: 'ingredient.lobster',
    name: 'lobster',
    plural: 'lobsters',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece', 'whole'],
    commonPreparations: ['tail', 'meat', 'whole', 'cooked'],
    searchTerms: ['lobster', 'lobster tail', 'lobster meat']
  },

  scallops: {
    id: 'scallops',
    nameKey: 'ingredient.scallops',
    name: 'scallops',
    plural: 'scallops',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'piece'],
    commonPreparations: ['large', 'medium', 'bay scallops', 'fresh'],
    searchTerms: ['scallops', 'sea scallops', 'bay scallops', 'fresh scallops']
  },

  eggs: {
    id: 'eggs',
    nameKey: 'ingredient.eggs',
    name: 'eggs',
    plural: 'eggs',
    category: 'proteins',
    commonUnits: ['piece', 'whole', 'large', 'medium'],
    commonPreparations: ['beaten', 'separated', 'whole', 'whites', 'yolks'],
    searchTerms: ['eggs', 'egg', 'large eggs', 'chicken eggs']
  },

  tofu: {
    id: 'tofu',
    nameKey: 'ingredient.tofu',
    name: 'tofu',
    plural: 'tofu',
    category: 'proteins',
    commonUnits: ['lb', 'oz', 'package', 'cup'],
    commonPreparations: ['cubed', 'sliced', 'crumbled', 'firm', 'silken'],
    searchTerms: ['tofu', 'firm tofu', 'silken tofu', 'extra firm tofu']
  },

  tempeh: {
    id: 'tempeh',
    nameKey: 'ingredient.tempeh',
    name: 'tempeh',
    plural: 'tempeh',
    category: 'proteins',
    commonUnits: ['oz', 'package', 'cup'],
    commonPreparations: ['sliced', 'cubed', 'crumbled', 'steamed'],
    searchTerms: ['tempeh', 'soy tempeh']
  },

  chickpeas: {
    id: 'chickpeas',
    nameKey: 'ingredient.chickpeas',
    name: 'chickpeas',
    plural: 'chickpeas',
    category: 'proteins',
    commonUnits: ['can', 'cup', 'lb'],
    commonPreparations: ['canned', 'dried', 'cooked', 'drained', 'rinsed'],
    searchTerms: ['chickpeas', 'garbanzo beans', 'canned chickpeas']
  },

  lentils: {
    id: 'lentils',
    nameKey: 'ingredient.lentils',
    name: 'lentils',
    plural: 'lentils',
    category: 'proteins',
    commonUnits: ['cup', 'lb', 'oz'],
    commonPreparations: ['dried', 'cooked', 'red', 'green', 'brown'],
    searchTerms: ['lentils', 'red lentils', 'green lentils', 'brown lentils']
  },

  black_beans: {
    id: 'black_beans',
    nameKey: 'ingredient.black_beans',
    name: 'black beans',
    plural: 'black beans',
    category: 'proteins',
    commonUnits: ['can', 'cup', 'lb'],
    commonPreparations: ['canned', 'dried', 'cooked', 'drained', 'rinsed'],
    searchTerms: ['black beans', 'canned black beans', 'dried black beans']
  },

  kidney_beans: {
    id: 'kidney_beans',
    nameKey: 'ingredient.kidney_beans',
    name: 'kidney beans',
    plural: 'kidney beans',
    category: 'proteins',
    commonUnits: ['can', 'cup', 'lb'],
    commonPreparations: ['canned', 'dried', 'cooked', 'drained', 'rinsed'],
    searchTerms: ['kidney beans', 'red kidney beans', 'canned kidney beans']
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

  heavy_cream: {
    id: 'heavy_cream',
    nameKey: 'ingredient.heavy_cream',
    name: 'heavy cream',
    plural: 'heavy cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'ml'],
    commonPreparations: ['whipped', 'cold', 'room temperature'],
    searchTerms: ['heavy cream', 'heavy whipping cream', 'whipping cream']
  },

  sour_cream: {
    id: 'sour_cream',
    nameKey: 'ingredient.sour_cream',
    name: 'sour cream',
    plural: 'sour cream',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'oz'],
    commonPreparations: ['room temperature', 'cold'],
    searchTerms: ['sour cream', 'light sour cream']
  },

  cream_cheese: {
    id: 'cream_cheese',
    nameKey: 'ingredient.cream_cheese',
    name: 'cream cheese',
    plural: 'cream cheese',
    category: 'dairy',
    commonUnits: ['oz', 'package', 'cup', 'tbsp'],
    commonPreparations: ['softened', 'room temperature', 'cold'],
    searchTerms: ['cream cheese', 'philadelphia cream cheese', 'low fat cream cheese']
  },

  yogurt: {
    id: 'yogurt',
    nameKey: 'ingredient.yogurt',
    name: 'yogurt',
    plural: 'yogurt',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'container'],
    commonPreparations: ['plain', 'greek', 'vanilla', 'low fat'],
    searchTerms: ['yogurt', 'greek yogurt', 'plain yogurt', 'vanilla yogurt']
  },

  cottage_cheese: {
    id: 'cottage_cheese',
    nameKey: 'ingredient.cottage_cheese',
    name: 'cottage cheese',
    plural: 'cottage cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'container'],
    commonPreparations: ['small curd', 'large curd', 'low fat'],
    searchTerms: ['cottage cheese', 'small curd cottage cheese', 'low fat cottage cheese']
  },

  ricotta_cheese: {
    id: 'ricotta_cheese',
    nameKey: 'ingredient.ricotta_cheese',
    name: 'ricotta cheese',
    plural: 'ricotta cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'container'],
    commonPreparations: ['whole milk', 'part skim', 'fresh'],
    searchTerms: ['ricotta cheese', 'whole milk ricotta', 'part skim ricotta']
  },

  mozzarella_cheese: {
    id: 'mozzarella_cheese',
    nameKey: 'ingredient.mozzarella_cheese',
    name: 'mozzarella cheese',
    plural: 'mozzarella cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
    commonPreparations: ['shredded', 'sliced', 'fresh', 'whole milk'],
    searchTerms: ['mozzarella cheese', 'fresh mozzarella', 'shredded mozzarella', 'mozzarella']
  },

  cheddar_cheese: {
    id: 'cheddar_cheese',
    nameKey: 'ingredient.cheddar_cheese',
    name: 'cheddar cheese',
    plural: 'cheddar cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
    commonPreparations: ['shredded', 'sliced', 'sharp', 'mild', 'aged'],
    searchTerms: ['cheddar cheese', 'sharp cheddar', 'mild cheddar', 'aged cheddar']
  },

  parmesan_cheese: {
    id: 'parmesan_cheese',
    nameKey: 'ingredient.parmesan_cheese',
    name: 'parmesan cheese',
    plural: 'parmesan cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['grated', 'shredded', 'fresh', 'aged'],
    searchTerms: ['parmesan cheese', 'parmigiano reggiano', 'grated parmesan', 'fresh parmesan']
  },

  feta_cheese: {
    id: 'feta_cheese',
    nameKey: 'ingredient.feta_cheese',
    name: 'feta cheese',
    plural: 'feta cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'crumbles'],
    commonPreparations: ['crumbled', 'cubed', 'whole'],
    searchTerms: ['feta cheese', 'crumbled feta', 'greek feta']
  },

  goat_cheese: {
    id: 'goat_cheese',
    nameKey: 'ingredient.goat_cheese',
    name: 'goat cheese',
    plural: 'goat cheese',
    category: 'dairy',
    commonUnits: ['oz', 'cup', 'log'],
    commonPreparations: ['soft', 'crumbled', 'fresh'],
    searchTerms: ['goat cheese', 'chevre', 'soft goat cheese']
  },

  swiss_cheese: {
    id: 'swiss_cheese',
    nameKey: 'ingredient.swiss_cheese',
    name: 'swiss cheese',
    plural: 'swiss cheese',
    category: 'dairy',
    commonUnits: ['cup', 'oz', 'slice'],
    commonPreparations: ['shredded', 'sliced', 'grated'],
    searchTerms: ['swiss cheese', 'gruyere', 'emmental']
  },

  buttermilk: {
    id: 'buttermilk',
    nameKey: 'ingredient.buttermilk',
    name: 'buttermilk',
    plural: 'buttermilk',
    category: 'dairy',
    commonUnits: ['cup', 'tbsp', 'ml'],
    commonPreparations: ['cold', 'room temperature', 'low fat'],
    searchTerms: ['buttermilk', 'cultured buttermilk', 'low fat buttermilk']
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

  brown_rice: {
    id: 'brown_rice',
    nameKey: 'ingredient.brown_rice',
    name: 'brown rice',
    plural: 'brown rice',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['rinsed', 'cooked', 'uncooked'],
    searchTerms: ['brown rice', 'whole grain rice', 'long grain brown rice']
  },

  pasta: {
    id: 'pasta',
    nameKey: 'ingredient.pasta',
    name: 'pasta',
    plural: 'pasta',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box', 'package'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['pasta', 'spaghetti', 'penne', 'linguine', 'noodles']
  },

  spaghetti: {
    id: 'spaghetti',
    nameKey: 'ingredient.spaghetti',
    name: 'spaghetti',
    plural: 'spaghetti',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['spaghetti', 'spaghetti pasta', 'long pasta']
  },

  penne: {
    id: 'penne',
    nameKey: 'ingredient.penne',
    name: 'penne',
    plural: 'penne',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['penne', 'penne pasta', 'tube pasta']
  },

  linguine: {
    id: 'linguine',
    nameKey: 'ingredient.linguine',
    name: 'linguine',
    plural: 'linguine',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['linguine', 'linguine pasta', 'flat pasta']
  },

  fettuccine: {
    id: 'fettuccine',
    nameKey: 'ingredient.fettuccine',
    name: 'fettuccine',
    plural: 'fettuccine',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['fettuccine', 'fettuccine pasta', 'flat noodles']
  },

  rigatoni: {
    id: 'rigatoni',
    nameKey: 'ingredient.rigatoni',
    name: 'rigatoni',
    plural: 'rigatoni',
    category: 'grains',
    commonUnits: ['lb', 'oz', 'box'],
    commonPreparations: ['cooked', 'uncooked', 'al dente'],
    searchTerms: ['rigatoni', 'rigatoni pasta', 'tube pasta']
  },

  lasagna_noodles: {
    id: 'lasagna_noodles',
    nameKey: 'ingredient.lasagna_noodles',
    name: 'lasagna noodles',
    plural: 'lasagna noodles',
    category: 'grains',
    commonUnits: ['box', 'sheet', 'piece'],
    commonPreparations: ['cooked', 'uncooked', 'no boil'],
    searchTerms: ['lasagna noodles', 'lasagne sheets', 'pasta sheets']
  },

  bread: {
    id: 'bread',
    nameKey: 'ingredient.bread',
    name: 'bread',
    plural: 'breads',
    category: 'grains',
    commonUnits: ['slice', 'cup', 'piece', 'loaf'],
    commonPreparations: ['sliced', 'cubed', 'toasted', 'fresh'],
    searchTerms: ['bread', 'white bread', 'whole wheat bread', 'sourdough']
  },

  breadcrumbs: {
    id: 'breadcrumbs',
    nameKey: 'ingredient.breadcrumbs',
    name: 'breadcrumbs',
    plural: 'breadcrumbs',
    category: 'grains',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['fresh', 'dried', 'seasoned', 'plain'],
    searchTerms: ['breadcrumbs', 'bread crumbs', 'panko', 'fresh breadcrumbs']
  },

  oats: {
    id: 'oats',
    nameKey: 'ingredient.oats',
    name: 'oats',
    plural: 'oats',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['rolled', 'quick cooking', 'steel cut', 'old fashioned'],
    searchTerms: ['oats', 'rolled oats', 'oatmeal', 'quick oats', 'steel cut oats']
  },

  quinoa: {
    id: 'quinoa',
    nameKey: 'ingredient.quinoa',
    name: 'quinoa',
    plural: 'quinoa',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['rinsed', 'cooked', 'uncooked'],
    searchTerms: ['quinoa', 'red quinoa', 'white quinoa', 'tri color quinoa']
  },

  barley: {
    id: 'barley',
    nameKey: 'ingredient.barley',
    name: 'barley',
    plural: 'barley',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['pearl', 'hulled', 'cooked'],
    searchTerms: ['barley', 'pearl barley', 'hulled barley']
  },

  bulgur: {
    id: 'bulgur',
    nameKey: 'ingredient.bulgur',
    name: 'bulgur',
    plural: 'bulgur',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['fine', 'coarse', 'medium'],
    searchTerms: ['bulgur', 'bulgur wheat', 'cracked wheat']
  },

  couscous: {
    id: 'couscous',
    nameKey: 'ingredient.couscous',
    name: 'couscous',
    plural: 'couscous',
    category: 'grains',
    commonUnits: ['cup', 'oz', 'box'],
    commonPreparations: ['instant', 'regular', 'whole wheat'],
    searchTerms: ['couscous', 'instant couscous', 'whole wheat couscous']
  },

  buckwheat: {
    id: 'buckwheat',
    nameKey: 'ingredient.buckwheat',
    name: 'buckwheat',
    plural: 'buckwheat',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['groats', 'flour', 'kasha'],
    searchTerms: ['buckwheat', 'buckwheat groats', 'kasha']
  },

  wild_rice: {
    id: 'wild_rice',
    nameKey: 'ingredient.wild_rice',
    name: 'wild rice',
    plural: 'wild rice',
    category: 'grains',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['rinsed', 'cooked', 'uncooked'],
    searchTerms: ['wild rice', 'black rice', 'long grain wild rice']
  },

  cornmeal: {
    id: 'cornmeal',
    nameKey: 'ingredient.cornmeal',
    name: 'cornmeal',
    plural: 'cornmeal',
    category: 'grains',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['fine', 'coarse', 'medium'],
    searchTerms: ['cornmeal', 'yellow cornmeal', 'white cornmeal', 'polenta']
  },

  semolina: {
    id: 'semolina',
    nameKey: 'ingredient.semolina',
    name: 'semolina',
    plural: 'semolina',
    category: 'grains',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['fine', 'coarse'],
    searchTerms: ['semolina', 'semolina flour', 'durum wheat']
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
  
  basil: {
    id: 'basil',
    nameKey: 'ingredient.basil',
    name: 'basil',
    plural: 'basil',
    category: 'spices',
    commonUnits: ['sprig', 'cup', 'tbsp', 'tsp'],
    commonPreparations: ['fresh', 'dried', 'chopped', 'torn'],
    searchTerms: ['basil', 'fresh basil', 'dried basil', 'sweet basil', 'thai basil']
  },
  
  thyme: {
    id: 'thyme',
    nameKey: 'ingredient.thyme',
    name: 'thyme',
    plural: 'thyme',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'sprig'],
    commonPreparations: ['fresh', 'dried', 'leaves'],
    searchTerms: ['thyme', 'fresh thyme', 'dried thyme', 'thyme leaves']
  },
  
  rosemary: {
    id: 'rosemary',
    nameKey: 'ingredient.rosemary',
    name: 'rosemary',
    plural: 'rosemary',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'sprig'],
    commonPreparations: ['fresh', 'dried', 'chopped', 'minced'],
    searchTerms: ['rosemary', 'fresh rosemary', 'dried rosemary']
  },
  
  sage: {
    id: 'sage',
    nameKey: 'ingredient.sage',
    name: 'sage',
    plural: 'sage',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'sprig'],
    commonPreparations: ['fresh', 'dried', 'chopped', 'whole'],
    searchTerms: ['sage', 'fresh sage', 'dried sage', 'sage leaves']
  },
  
  cilantro: {
    id: 'cilantro',
    nameKey: 'ingredient.cilantro',
    name: 'cilantro',
    plural: 'cilantro',
    category: 'spices',
    commonUnits: ['cup', 'tbsp', 'sprig'],
    commonPreparations: ['fresh', 'chopped', 'minced'],
    searchTerms: ['cilantro', 'fresh cilantro', 'coriander leaves']
  },
  
  dill: {
    id: 'dill',
    nameKey: 'ingredient.dill',
    name: 'dill',
    plural: 'dill',
    category: 'spices',
    commonUnits: ['tbsp', 'tsp', 'sprig'],
    commonPreparations: ['fresh', 'dried', 'chopped'],
    searchTerms: ['dill', 'fresh dill', 'dried dill', 'dill weed']
  },
  
  chives: {
    id: 'chives',
    nameKey: 'ingredient.chives',
    name: 'chives',
    plural: 'chives',
    category: 'spices',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['fresh', 'dried', 'chopped', 'minced'],
    searchTerms: ['chives', 'fresh chives', 'dried chives']
  },
  
  mint: {
    id: 'mint',
    nameKey: 'ingredient.mint',
    name: 'mint',
    plural: 'mint',
    category: 'spices',
    commonUnits: ['sprig', 'cup', 'tbsp'],
    commonPreparations: ['fresh', 'dried', 'chopped'],
    searchTerms: ['mint', 'fresh mint', 'dried mint', 'spearmint', 'peppermint']
  },
  
  garlic_powder: {
    id: 'garlic_powder',
    nameKey: 'ingredient.garlic_powder',
    name: 'garlic powder',
    plural: 'garlic powder',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground'],
    searchTerms: ['garlic powder', 'powdered garlic']
  },
  
  onion_powder: {
    id: 'onion_powder',
    nameKey: 'ingredient.onion_powder',
    name: 'onion powder',
    plural: 'onion powder',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground'],
    searchTerms: ['onion powder', 'powdered onion']
  },
  
  paprika: {
    id: 'paprika',
    nameKey: 'ingredient.paprika',
    name: 'paprika',
    plural: 'paprika',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground', 'sweet', 'smoked', 'hot'],
    searchTerms: ['paprika', 'sweet paprika', 'smoked paprika', 'hot paprika']
  },
  
  cumin: {
    id: 'cumin',
    nameKey: 'ingredient.cumin',
    name: 'cumin',
    plural: 'cumin',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground', 'whole seeds'],
    searchTerms: ['cumin', 'ground cumin', 'cumin seeds']
  },
  
  coriander: {
    id: 'coriander',
    nameKey: 'ingredient.coriander',
    name: 'coriander',
    plural: 'coriander',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground', 'whole seeds'],
    searchTerms: ['coriander', 'ground coriander', 'coriander seeds']
  },
  
  chili_powder: {
    id: 'chili_powder',
    nameKey: 'ingredient.chili_powder',
    name: 'chili powder',
    plural: 'chili powder',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground'],
    searchTerms: ['chili powder', 'chile powder']
  },
  
  cayenne_pepper: {
    id: 'cayenne_pepper',
    nameKey: 'ingredient.cayenne_pepper',
    name: 'cayenne pepper',
    plural: 'cayenne pepper',
    category: 'spices',
    commonUnits: ['tsp', 'pinch'],
    commonPreparations: ['ground'],
    searchTerms: ['cayenne pepper', 'cayenne', 'ground cayenne']
  },
  
  red_pepper_flakes: {
    id: 'red_pepper_flakes',
    nameKey: 'ingredient.red_pepper_flakes',
    name: 'red pepper flakes',
    plural: 'red pepper flakes',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['crushed'],
    searchTerms: ['red pepper flakes', 'crushed red pepper', 'red chili flakes']
  },
  
  ginger: {
    id: 'ginger',
    nameKey: 'ingredient.ginger',
    name: 'ginger',
    plural: 'ginger',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'piece', 'inch'],
    commonPreparations: ['fresh', 'ground', 'grated', 'minced'],
    searchTerms: ['ginger', 'fresh ginger', 'ground ginger', 'ginger root']
  },
  
  turmeric: {
    id: 'turmeric',
    nameKey: 'ingredient.turmeric',
    name: 'turmeric',
    plural: 'turmeric',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground', 'fresh'],
    searchTerms: ['turmeric', 'ground turmeric', 'fresh turmeric']
  },
  
  cinnamon: {
    id: 'cinnamon',
    nameKey: 'ingredient.cinnamon',
    name: 'cinnamon',
    plural: 'cinnamon',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch', 'stick'],
    commonPreparations: ['ground', 'stick', 'whole'],
    searchTerms: ['cinnamon', 'ground cinnamon', 'cinnamon stick']
  },
  
  nutmeg: {
    id: 'nutmeg',
    nameKey: 'ingredient.nutmeg',
    name: 'nutmeg',
    plural: 'nutmeg',
    category: 'spices',
    commonUnits: ['tsp', 'pinch'],
    commonPreparations: ['ground', 'fresh grated', 'whole'],
    searchTerms: ['nutmeg', 'ground nutmeg', 'fresh nutmeg']
  },
  
  cloves: {
    id: 'cloves',
    nameKey: 'ingredient.cloves',
    name: 'cloves',
    plural: 'cloves',
    category: 'spices',
    commonUnits: ['tsp', 'pinch', 'whole'],
    commonPreparations: ['ground', 'whole'],
    searchTerms: ['cloves', 'ground cloves', 'whole cloves']
  },
  
  allspice: {
    id: 'allspice',
    nameKey: 'ingredient.allspice',
    name: 'allspice',
    plural: 'allspice',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    commonPreparations: ['ground', 'whole berries'],
    searchTerms: ['allspice', 'ground allspice', 'allspice berries']
  },
  
  cardamom: {
    id: 'cardamom',
    nameKey: 'ingredient.cardamom',
    name: 'cardamom',
    plural: 'cardamom',
    category: 'spices',
    commonUnits: ['tsp', 'pinch', 'pod'],
    commonPreparations: ['ground', 'whole pods', 'seeds'],
    searchTerms: ['cardamom', 'ground cardamom', 'cardamom pods']
  },
  
  bay_leaves: {
    id: 'bay_leaves',
    nameKey: 'ingredient.bay_leaves',
    name: 'bay leaves',
    plural: 'bay leaves',
    category: 'spices',
    commonUnits: ['piece', 'whole'],
    commonPreparations: ['dried', 'whole'],
    searchTerms: ['bay leaves', 'bay leaf', 'dried bay leaves']
  },
  
  fennel_seeds: {
    id: 'fennel_seeds',
    nameKey: 'ingredient.fennel_seeds',
    name: 'fennel seeds',
    plural: 'fennel seeds',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['whole', 'ground'],
    searchTerms: ['fennel seeds', 'ground fennel']
  },
  
  mustard_seeds: {
    id: 'mustard_seeds',
    nameKey: 'ingredient.mustard_seeds',
    name: 'mustard seeds',
    plural: 'mustard seeds',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['whole', 'ground'],
    searchTerms: ['mustard seeds', 'yellow mustard seeds', 'black mustard seeds']
  },
  
  sesame_seeds: {
    id: 'sesame_seeds',
    nameKey: 'ingredient.sesame_seeds',
    name: 'sesame seeds',
    plural: 'sesame seeds',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp', 'cup'],
    commonPreparations: ['toasted', 'raw', 'black', 'white'],
    searchTerms: ['sesame seeds', 'toasted sesame seeds', 'black sesame seeds']
  },
  
  poppy_seeds: {
    id: 'poppy_seeds',
    nameKey: 'ingredient.poppy_seeds',
    name: 'poppy seeds',
    plural: 'poppy seeds',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['whole'],
    searchTerms: ['poppy seeds']
  },
  
  celery_seed: {
    id: 'celery_seed',
    nameKey: 'ingredient.celery_seed',
    name: 'celery seed',
    plural: 'celery seed',
    category: 'spices',
    commonUnits: ['tsp', 'pinch'],
    commonPreparations: ['ground', 'whole'],
    searchTerms: ['celery seed', 'celery seeds', 'ground celery seed']
  },
  
  italian_seasoning: {
    id: 'italian_seasoning',
    nameKey: 'ingredient.italian_seasoning',
    name: 'Italian seasoning',
    plural: 'Italian seasoning',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['dried blend'],
    searchTerms: ['Italian seasoning', 'italian herbs', 'herb blend']
  },
  
  herbs_de_provence: {
    id: 'herbs_de_provence',
    nameKey: 'ingredient.herbs_de_provence',
    name: 'herbs de Provence',
    plural: 'herbs de Provence',
    category: 'spices',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['dried blend'],
    searchTerms: ['herbs de Provence', 'herbes de provence', 'provence herbs']
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
  
  lime: {
    id: 'lime',
    nameKey: 'ingredient.lime',
    name: 'lime',
    plural: 'limes',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'tbsp', 'tsp', 'medium'],
    commonPreparations: ['juiced', 'zested', 'sliced', 'wedges', 'halved'],
    searchTerms: ['lime', 'limes', 'lime juice', 'fresh lime']
  },
  
  orange: {
    id: 'orange',
    nameKey: 'ingredient.orange',
    name: 'orange',
    plural: 'oranges',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'tbsp', 'medium', 'large'],
    commonPreparations: ['juiced', 'zested', 'sliced', 'peeled', 'sectioned'],
    searchTerms: ['orange', 'oranges', 'orange juice', 'fresh orange', 'navel orange']
  },
  
  apple: {
    id: 'apple',
    nameKey: 'ingredient.apple',
    name: 'apple',
    plural: 'apples',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large'],
    commonPreparations: ['peeled', 'cored', 'sliced', 'diced', 'chopped'],
    searchTerms: ['apple', 'apples', 'granny smith', 'red delicious', 'gala apple']
  },
  
  banana: {
    id: 'banana',
    nameKey: 'ingredient.banana',
    name: 'banana',
    plural: 'bananas',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large'],
    commonPreparations: ['peeled', 'sliced', 'mashed', 'chopped'],
    searchTerms: ['banana', 'bananas', 'ripe banana']
  },
  
  strawberry: {
    id: 'strawberry',
    nameKey: 'ingredient.strawberry',
    name: 'strawberry',
    plural: 'strawberries',
    category: 'fruits',
    commonUnits: ['cup', 'piece', 'pint'],
    commonPreparations: ['hulled', 'sliced', 'chopped', 'fresh', 'frozen'],
    searchTerms: ['strawberry', 'strawberries', 'fresh strawberries', 'frozen strawberries']
  },
  
  blueberry: {
    id: 'blueberry',
    nameKey: 'ingredient.blueberry',
    name: 'blueberry',
    plural: 'blueberries',
    category: 'fruits',
    commonUnits: ['cup', 'pint'],
    commonPreparations: ['fresh', 'frozen', 'dried'],
    searchTerms: ['blueberry', 'blueberries', 'fresh blueberries', 'frozen blueberries']
  },
  
  raspberry: {
    id: 'raspberry',
    nameKey: 'ingredient.raspberry',
    name: 'raspberry',
    plural: 'raspberries',
    category: 'fruits',
    commonUnits: ['cup', 'pint'],
    commonPreparations: ['fresh', 'frozen'],
    searchTerms: ['raspberry', 'raspberries', 'fresh raspberries', 'frozen raspberries']
  },
  
  blackberry: {
    id: 'blackberry',
    nameKey: 'ingredient.blackberry',
    name: 'blackberry',
    plural: 'blackberries',
    category: 'fruits',
    commonUnits: ['cup', 'pint'],
    commonPreparations: ['fresh', 'frozen'],
    searchTerms: ['blackberry', 'blackberries', 'fresh blackberries']
  },
  
  grape: {
    id: 'grape',
    nameKey: 'ingredient.grape',
    name: 'grape',
    plural: 'grapes',
    category: 'fruits',
    commonUnits: ['cup', 'lb'],
    commonPreparations: ['fresh', 'halved', 'seedless'],
    searchTerms: ['grape', 'grapes', 'red grapes', 'green grapes', 'seedless grapes']
  },
  
  pear: {
    id: 'pear',
    nameKey: 'ingredient.pear',
    name: 'pear',
    plural: 'pears',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large'],
    commonPreparations: ['peeled', 'cored', 'sliced', 'diced'],
    searchTerms: ['pear', 'pears', 'bartlett pear', 'anjou pear']
  },
  
  peach: {
    id: 'peach',
    nameKey: 'ingredient.peach',
    name: 'peach',
    plural: 'peaches',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large'],
    commonPreparations: ['peeled', 'pitted', 'sliced', 'diced'],
    searchTerms: ['peach', 'peaches', 'fresh peach', 'ripe peach']
  },
  
  cherry: {
    id: 'cherry',
    nameKey: 'ingredient.cherry',
    name: 'cherry',
    plural: 'cherries',
    category: 'fruits',
    commonUnits: ['cup', 'lb'],
    commonPreparations: ['pitted', 'fresh', 'dried', 'frozen'],
    searchTerms: ['cherry', 'cherries', 'sweet cherries', 'sour cherries', 'dried cherries']
  },
  
  pineapple: {
    id: 'pineapple',
    nameKey: 'ingredient.pineapple',
    name: 'pineapple',
    plural: 'pineapples',
    category: 'fruits',
    commonUnits: ['cup', 'can', 'whole'],
    commonPreparations: ['cored', 'peeled', 'chunked', 'sliced', 'fresh', 'canned'],
    searchTerms: ['pineapple', 'fresh pineapple', 'canned pineapple', 'pineapple chunks']
  },
  
  mango: {
    id: 'mango',
    nameKey: 'ingredient.mango',
    name: 'mango',
    plural: 'mangoes',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup'],
    commonPreparations: ['peeled', 'pitted', 'diced', 'sliced'],
    searchTerms: ['mango', 'mangoes', 'fresh mango', 'ripe mango']
  },
  
  avocado: {
    id: 'avocado',
    nameKey: 'ingredient.avocado',
    name: 'avocado',
    plural: 'avocados',
    category: 'fruits',
    commonUnits: ['piece', 'whole', 'cup', 'medium', 'large'],
    commonPreparations: ['peeled', 'pitted', 'sliced', 'diced', 'mashed'],
    searchTerms: ['avocado', 'avocados', 'ripe avocado', 'hass avocado']
  },
  
  coconut: {
    id: 'coconut',
    nameKey: 'ingredient.coconut',
    name: 'coconut',
    plural: 'coconuts',
    category: 'fruits',
    commonUnits: ['cup', 'can', 'tbsp'],
    commonPreparations: ['shredded', 'flaked', 'milk', 'cream', 'fresh'],
    searchTerms: ['coconut', 'coconut milk', 'shredded coconut', 'coconut flakes']
  },
  
  cranberry: {
    id: 'cranberry',
    nameKey: 'ingredient.cranberry',
    name: 'cranberry',
    plural: 'cranberries',
    category: 'fruits',
    commonUnits: ['cup', 'bag'],
    commonPreparations: ['fresh', 'dried', 'frozen'],
    searchTerms: ['cranberry', 'cranberries', 'fresh cranberries', 'dried cranberries']
  },
  
  // Nuts & Seeds
  almond: {
    id: 'almond',
    nameKey: 'ingredient.almond',
    name: 'almond',
    plural: 'almonds',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'sliced', 'chopped', 'ground', 'blanched'],
    searchTerms: ['almond', 'almonds', 'blanched almonds', 'sliced almonds']
  },
  
  walnut: {
    id: 'walnut',
    nameKey: 'ingredient.walnut',
    name: 'walnut',
    plural: 'walnuts',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'chopped', 'halves', 'pieces'],
    searchTerms: ['walnut', 'walnuts', 'walnut halves', 'chopped walnuts']
  },
  
  pecan: {
    id: 'pecan',
    nameKey: 'ingredient.pecan',
    name: 'pecan',
    plural: 'pecans',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'chopped', 'halves', 'pieces'],
    searchTerms: ['pecan', 'pecans', 'pecan halves', 'chopped pecans']
  },
  
  cashew: {
    id: 'cashew',
    nameKey: 'ingredient.cashew',
    name: 'cashew',
    plural: 'cashews',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'chopped', 'roasted', 'raw'],
    searchTerms: ['cashew', 'cashews', 'roasted cashews', 'raw cashews']
  },
  
  peanut: {
    id: 'peanut',
    nameKey: 'ingredient.peanut',
    name: 'peanut',
    plural: 'peanuts',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'chopped', 'roasted', 'salted', 'unsalted'],
    searchTerms: ['peanut', 'peanuts', 'roasted peanuts', 'salted peanuts']
  },
  
  pistachio: {
    id: 'pistachio',
    nameKey: 'ingredient.pistachio',
    name: 'pistachio',
    plural: 'pistachios',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['shelled', 'chopped', 'whole'],
    searchTerms: ['pistachio', 'pistachios', 'shelled pistachios']
  },
  
  hazelnut: {
    id: 'hazelnut',
    nameKey: 'ingredient.hazelnut',
    name: 'hazelnut',
    plural: 'hazelnuts',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'piece'],
    commonPreparations: ['whole', 'chopped', 'toasted', 'skinned'],
    searchTerms: ['hazelnut', 'hazelnuts', 'toasted hazelnuts']
  },
  
  pine_nuts: {
    id: 'pine_nuts',
    nameKey: 'ingredient.pine_nuts',
    name: 'pine nuts',
    plural: 'pine nuts',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['toasted', 'raw'],
    searchTerms: ['pine nuts', 'pignoli', 'toasted pine nuts']
  },
  
  sunflower_seeds: {
    id: 'sunflower_seeds',
    nameKey: 'ingredient.sunflower_seeds',
    name: 'sunflower seeds',
    plural: 'sunflower seeds',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['hulled', 'roasted', 'raw', 'salted'],
    searchTerms: ['sunflower seeds', 'hulled sunflower seeds']
  },
  
  pumpkin_seeds: {
    id: 'pumpkin_seeds',
    nameKey: 'ingredient.pumpkin_seeds',
    name: 'pumpkin seeds',
    plural: 'pumpkin seeds',
    category: 'nuts',
    commonUnits: ['cup', 'oz', 'tbsp'],
    commonPreparations: ['hulled', 'roasted', 'raw'],
    searchTerms: ['pumpkin seeds', 'pepitas', 'hulled pumpkin seeds']
  },
  
  flaxseed: {
    id: 'flaxseed',
    nameKey: 'ingredient.flaxseed',
    name: 'flaxseed',
    plural: 'flaxseeds',
    category: 'nuts',
    commonUnits: ['tbsp', 'cup', 'tsp'],
    commonPreparations: ['whole', 'ground', 'meal'],
    searchTerms: ['flaxseed', 'flaxseeds', 'ground flaxseed', 'flax meal']
  },
  
  chia_seeds: {
    id: 'chia_seeds',
    nameKey: 'ingredient.chia_seeds',
    name: 'chia seeds',
    plural: 'chia seeds',
    category: 'nuts',
    commonUnits: ['tbsp', 'cup', 'tsp'],
    commonPreparations: ['whole'],
    searchTerms: ['chia seeds', 'chia']
  },
  
  black_beans: {
    id: 'black_beans',
    nameKey: 'ingredient.black_beans',
    name: 'black beans',
    plural: 'black beans',
    category: 'nuts',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['dried', 'canned', 'cooked', 'drained'],
    searchTerms: ['black beans', 'canned black beans', 'dried black beans']
  },
  
  kidney_beans: {
    id: 'kidney_beans',
    nameKey: 'ingredient.kidney_beans',
    name: 'kidney beans',
    plural: 'kidney beans',
    category: 'nuts',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['dried', 'canned', 'cooked', 'drained'],
    searchTerms: ['kidney beans', 'red kidney beans', 'canned kidney beans']
  },
  
  chickpeas: {
    id: 'chickpeas',
    nameKey: 'ingredient.chickpeas',
    name: 'chickpeas',
    plural: 'chickpeas',
    category: 'nuts',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['dried', 'canned', 'cooked', 'drained'],
    searchTerms: ['chickpeas', 'garbanzo beans', 'canned chickpeas']
  },
  
  lentils: {
    id: 'lentils',
    nameKey: 'ingredient.lentils',
    name: 'lentils',
    plural: 'lentils',
    category: 'nuts',
    commonUnits: ['cup', 'oz'],
    commonPreparations: ['dried', 'cooked', 'red', 'green', 'brown'],
    searchTerms: ['lentils', 'red lentils', 'green lentils', 'brown lentils']
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
  },
  
  flour: {
    id: 'flour',
    nameKey: 'ingredient.flour',
    name: 'flour',
    plural: 'flour',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
    commonPreparations: ['all-purpose', 'bread', 'cake', 'whole wheat', 'sifted'],
    searchTerms: ['flour', 'all-purpose flour', 'bread flour', 'cake flour', 'whole wheat flour']
  },
  
  baking_powder: {
    id: 'baking_powder',
    nameKey: 'ingredient.baking_powder',
    name: 'baking powder',
    plural: 'baking powder',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: ['double-acting'],
    searchTerms: ['baking powder', 'double-acting baking powder']
  },
  
  baking_soda: {
    id: 'baking_soda',
    nameKey: 'ingredient.baking_soda',
    name: 'baking soda',
    plural: 'baking soda',
    category: 'pantry',
    commonUnits: ['tsp', 'tbsp'],
    commonPreparations: [],
    searchTerms: ['baking soda', 'sodium bicarbonate']
  },
  
  honey: {
    id: 'honey',
    nameKey: 'ingredient.honey',
    name: 'honey',
    plural: 'honey',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['raw', 'clover', 'wildflower'],
    searchTerms: ['honey', 'raw honey', 'clover honey']
  },
  
  maple_syrup: {
    id: 'maple_syrup',
    nameKey: 'ingredient.maple_syrup',
    name: 'maple syrup',
    plural: 'maple syrup',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['pure', 'grade A'],
    searchTerms: ['maple syrup', 'pure maple syrup']
  },
  
  vinegar: {
    id: 'vinegar',
    nameKey: 'ingredient.vinegar',
    name: 'vinegar',
    plural: 'vinegar',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['white', 'apple cider', 'balsamic', 'red wine', 'rice'],
    searchTerms: ['vinegar', 'white vinegar', 'apple cider vinegar', 'balsamic vinegar']
  },
  
  soy_sauce: {
    id: 'soy_sauce',
    nameKey: 'ingredient.soy_sauce',
    name: 'soy sauce',
    plural: 'soy sauce',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['low sodium', 'regular', 'dark', 'light'],
    searchTerms: ['soy sauce', 'low sodium soy sauce', 'dark soy sauce']
  },
  
  worcestershire_sauce: {
    id: 'worcestershire_sauce',
    nameKey: 'ingredient.worcestershire_sauce',
    name: 'Worcestershire sauce',
    plural: 'Worcestershire sauce',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp'],
    commonPreparations: [],
    searchTerms: ['Worcestershire sauce', 'worcestershire']
  },
  
  hot_sauce: {
    id: 'hot_sauce',
    nameKey: 'ingredient.hot_sauce',
    name: 'hot sauce',
    plural: 'hot sauce',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'dash'],
    commonPreparations: ['Tabasco', 'sriracha', 'chipotle'],
    searchTerms: ['hot sauce', 'Tabasco', 'sriracha', 'chipotle sauce']
  },
  
  mustard: {
    id: 'mustard',
    nameKey: 'ingredient.mustard',
    name: 'mustard',
    plural: 'mustard',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp'],
    commonPreparations: ['Dijon', 'yellow', 'whole grain', 'honey'],
    searchTerms: ['mustard', 'Dijon mustard', 'yellow mustard', 'whole grain mustard']
  },
  
  mayonnaise: {
    id: 'mayonnaise',
    nameKey: 'ingredient.mayonnaise',
    name: 'mayonnaise',
    plural: 'mayonnaise',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['regular', 'light', 'vegan'],
    searchTerms: ['mayonnaise', 'mayo', 'light mayo']
  },
  
  ketchup: {
    id: 'ketchup',
    nameKey: 'ingredient.ketchup',
    name: 'ketchup',
    plural: 'ketchup',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: [],
    searchTerms: ['ketchup', 'tomato ketchup']
  },
  
  brown_sugar: {
    id: 'brown_sugar',
    nameKey: 'ingredient.brown_sugar',
    name: 'brown sugar',
    plural: 'brown sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
    commonPreparations: ['light', 'dark', 'packed'],
    searchTerms: ['brown sugar', 'light brown sugar', 'dark brown sugar', 'packed brown sugar']
  },
  
  powdered_sugar: {
    id: 'powdered_sugar',
    nameKey: 'ingredient.powdered_sugar',
    name: 'powdered sugar',
    plural: 'powdered sugar',
    category: 'pantry',
    commonUnits: ['cup', 'tbsp', 'tsp'],
    commonPreparations: ['confectioners', 'sifted'],
    searchTerms: ['powdered sugar', 'confectioners sugar', 'icing sugar']
  },
  
  cornstarch: {
    id: 'cornstarch',
    nameKey: 'ingredient.cornstarch',
    name: 'cornstarch',
    plural: 'cornstarch',
    category: 'pantry',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: [],
    searchTerms: ['cornstarch', 'corn starch']
  },
  
  vegetable_oil: {
    id: 'vegetable_oil',
    nameKey: 'ingredient.vegetable_oil',
    name: 'vegetable oil',
    plural: 'vegetable oil',
    category: 'oils',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: [],
    searchTerms: ['vegetable oil', 'canola oil']
  },
  
  coconut_oil: {
    id: 'coconut_oil',
    nameKey: 'ingredient.coconut_oil',
    name: 'coconut oil',
    plural: 'coconut oil',
    category: 'oils',
    commonUnits: ['tbsp', 'tsp', 'cup'],
    commonPreparations: ['virgin', 'refined', 'unrefined'],
    searchTerms: ['coconut oil', 'virgin coconut oil']
  },
  
  sesame_oil: {
    id: 'sesame_oil',
    nameKey: 'ingredient.sesame_oil',
    name: 'sesame oil',
    plural: 'sesame oil',
    category: 'oils',
    commonUnits: ['tbsp', 'tsp'],
    commonPreparations: ['toasted', 'light'],
    searchTerms: ['sesame oil', 'toasted sesame oil']
  },
  
  chicken_broth: {
    id: 'chicken_broth',
    nameKey: 'ingredient.chicken_broth',
    name: 'chicken broth',
    plural: 'chicken broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['low sodium', 'regular'],
    searchTerms: ['chicken broth', 'chicken stock', 'low sodium chicken broth']
  },
  
  beef_broth: {
    id: 'beef_broth',
    nameKey: 'ingredient.beef_broth',
    name: 'beef broth',
    plural: 'beef broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['low sodium', 'regular'],
    searchTerms: ['beef broth', 'beef stock', 'low sodium beef broth']
  },
  
  vegetable_broth: {
    id: 'vegetable_broth',
    nameKey: 'ingredient.vegetable_broth',
    name: 'vegetable broth',
    plural: 'vegetable broth',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'oz'],
    commonPreparations: ['low sodium', 'regular'],
    searchTerms: ['vegetable broth', 'vegetable stock', 'low sodium vegetable broth']
  },
  
  tomato_paste: {
    id: 'tomato_paste',
    nameKey: 'ingredient.tomato_paste',
    name: 'tomato paste',
    plural: 'tomato paste',
    category: 'condiments',
    commonUnits: ['tbsp', 'tsp', 'can'],
    commonPreparations: [],
    searchTerms: ['tomato paste', 'canned tomato paste']
  },
  
  coconut_milk: {
    id: 'coconut_milk',
    nameKey: 'ingredient.coconut_milk',
    name: 'coconut milk',
    plural: 'coconut milk',
    category: 'pantry',
    commonUnits: ['cup', 'can', 'tbsp'],
    commonPreparations: ['full fat', 'light', 'canned'],
    searchTerms: ['coconut milk', 'canned coconut milk', 'full fat coconut milk']
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