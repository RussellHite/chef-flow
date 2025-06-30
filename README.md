# Chef Flow

A React Native mobile application that transforms traditional recipes into structured, step-by-step cooking flows with intelligent ingredient parsing and management.

## Overview

Chef Flow helps home cooks by:
- Converting free-form recipes into structured cooking workflows
- Parsing ingredient lists with smart recognition (150+ ingredients)
- Providing step-by-step cooking guidance
- Managing ingredient databases with offline-first architecture
- Supporting complex ingredient specifications and preparations

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Tab + Stack navigators)
- **State Management**: React Context API
- **Data**: Embedded ingredient database with offline-first architecture
- **AI/ML**: Vector embeddings for ingredient similarity (Phase 2 implementation)
- **Platform**: iOS and Android via Expo Go

## Project Structure

```
chef-flow/
├── components/           # Reusable UI components
│   ├── StructuredIngredient.js  # Displays parsed ingredients
│   └── CookingIndicator.js      # Cooking session indicator
├── data/
│   └── ingredientDatabase.js    # 150+ ingredient definitions
├── hooks/
│   └── useCookingSession.js     # Cooking session management
├── navigation/
│   └── AppNavigator.js          # App navigation structure
├── screens/
│   ├── AddRecipeScreen.js       # Recipe input and parsing
│   ├── EditRecipeScreen.js      # Recipe editing interface
│   └── IngredientListScreen.js  # Admin ingredient database view
├── services/
│   ├── IngredientService.js           # Ingredient operations abstraction
│   ├── EmbeddedIngredientDataSource.js # Local ingredient database
│   ├── VectorService.js               # Vector embeddings (Phase 2)
│   ├── VectorConfig.js                # Vector feature configuration
│   └── TrainingDataService.js         # Recipe parsing training data
├── styles/               # Shared styling
└── utils/               # Utility functions and recipe parser
```

## Key Features

### 🧠 Intelligent Ingredient Parsing
- Handles complex patterns: `"2 (5 ounce) cans diced tomatoes"`
- Supports "divided" ingredients for multi-step recipes
- Extracts quantity, unit, ingredient name, and preparation method
- 150+ ingredient database with smart search and matching

### 📱 Recipe Management
- Convert traditional recipes to structured flows
- Step-by-step cooking guidance
- Ingredient preparation tracking
- Support for complex recipe structures

### 🔍 Advanced Search & Matching
- Vector-based ingredient similarity search (Phase 2)
- Fuzzy text matching for ingredient recognition
- Multiple search terms and aliases per ingredient
- Category-based ingredient organization

### ⚡ Performance & Offline
- Offline-first architecture
- Embedded ingredient database
- Fast local search and operations
- Optional vector database for enhanced matching

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chef-flow

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

### Development Commands

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

## Building & Deployment

### APK Build (Windows Host Machine Only)
**Important**: EAS builds must be executed on the Windows host machine, NOT through development environments.

```bash
# Build Android APK for testing
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production
```

**Why Windows-only:**
- EAS build requires stable internet and proper authentication
- Build process takes 5-10 minutes and may timeout in development environments
- User needs to monitor build progress and download APK manually

## Architecture

### Ingredient Database Structure

```javascript
{
  id: 'tomato',
  nameKey: 'ingredient.tomato',
  name: 'tomato',
  plural: 'tomatoes',
  category: 'vegetables',
  commonUnits: ['piece', 'cup', 'can', 'medium', 'large'],
  commonPreparations: ['diced', 'chopped', 'sliced', 'crushed'],
  searchTerms: ['tomato', 'tomatoes', 'roma tomato', 'cherry tomato']
}
```

### Categories
- **Vegetables** (25+ items): onions, tomatoes, peppers, leafy greens
- **Proteins** (20+ items): meats, poultry, seafood, eggs
- **Dairy** (13+ items): milk varieties, cheeses, yogurt, butter
- **Grains** (18+ items): rice, pasta, breads, alternative grains
- **Spices & Herbs** (31+ items): fresh herbs, ground spices, blends
- **Fruits** (18+ items): citrus, berries, common and tropical fruits
- **Nuts & Seeds** (16+ items): tree nuts, seeds, legumes
- **Pantry & Condiments** (24+ items): baking staples, sauces, oils

### Vector Database (Phase 2)
- **Model**: Sentence Transformers (all-MiniLM-L6-v2)
- **Dimensions**: 384-dimensional embeddings
- **Storage**: SQLite with vector extension
- **Performance**: <200ms response times for similarity search
- **Fallback**: Pseudo-embeddings for Expo Go compatibility

## Configuration

### Vector Features
Vector database features are configurable via `VectorConfig.js`:

```javascript
{
  vectorFeaturesEnabled: true,    // Enable vector features
  realEmbeddingsEnabled: false,   // Use real vs pseudo embeddings
  vectorDatabaseEnabled: false,   // SQLite vector storage
  debugMode: false               // Debug logging
}
```

### Feature Flags
- **Expo Go Mode**: Disables native dependencies for development
- **Vector Database**: Enable for production with native builds
- **Real Embeddings**: Enable for production ML-powered matching

## Contributing

### Adding New Ingredients

1. **Add to Database** (`data/ingredientDatabase.js`):
```javascript
new_ingredient: {
  id: 'new_ingredient',
  nameKey: 'ingredient.new_ingredient',
  name: 'new ingredient',
  plural: 'new ingredients',
  category: 'appropriate_category',
  commonUnits: ['cup', 'tbsp', 'piece'],
  commonPreparations: ['chopped', 'diced'],
  searchTerms: ['new ingredient', 'alternative name']
}
```

2. **Update Search Index**: The search index rebuilds automatically
3. **Test Parsing**: Verify ingredient recognition in recipe parsing

### Adding New Categories

1. **Update Categories** (`data/ingredientDatabase.js`):
```javascript
new_category: { 
  id: 'new_category', 
  nameKey: 'category.new_category', 
  name: 'New Category' 
}
```

2. **Add Ingredients**: Create ingredients with `category: 'new_category'`
3. **Update UI**: Category filters update automatically

### Recipe Parser Enhancement

The recipe parser (`EmbeddedIngredientDataSource.js`) handles:
- Quantity extraction (fractions, ranges, parenthetical info)
- Unit recognition (volume, weight, count, size descriptors)
- Ingredient identification (exact and fuzzy matching)
- Preparation method extraction
- "Divided" ingredient handling

### Testing Recipe Parsing

```javascript
// Test ingredient parsing
const dataSource = new EmbeddedIngredientDataSource();
const result = await dataSource.parseIngredientText("2 cups flour, sifted");

console.log(result);
// {
//   quantity: 2,
//   unit: { name: 'cup', plural: 'cups' },
//   ingredient: { name: 'flour', category: 'pantry' },
//   preparation: { name: 'sifted', requiresStep: true }
// }
```

## Troubleshooting

### Common Issues

1. **Metro Bundler Errors**: Clear cache with `npx expo start --clear`
2. **Permission Errors (Windows)**: Remove `.bin` directories in `node_modules`
3. **Navigation Context Errors**: Ensure components are within NavigationContainer
4. **Vector Database Errors**: Check if running in Expo Go (features disabled)

### Debug Mode

Enable debug logging in `VectorConfig.js`:
```javascript
debugMode: true,
verboseLogging: true
```

### Performance Issues

- **Large Recipe Lists**: Implement virtualization
- **Slow Parsing**: Check ingredient database size and search efficiency
- **Memory Usage**: Monitor vector cache size and cleanup

## Roadmap

### Phase 1 ✅ (Complete)
- [x] Basic ingredient database
- [x] Recipe parsing engine
- [x] Structured ingredient display
- [x] Admin interface for ingredient management

### Phase 2 ✅ (Complete)
- [x] Vector database infrastructure
- [x] Sentence Transformers integration
- [x] SQLite vector storage
- [x] Performance optimization (<200ms)
- [x] Expanded ingredient database (150+ items)

### Phase 3 (Planned)
- [ ] Recipe recommendation engine
- [ ] Cooking step optimization
- [ ] Shopping list generation
- [ ] Recipe sharing and community features
- [ ] Nutritional analysis integration

## API Reference

### IngredientService

```javascript
// Search ingredients
const results = await IngredientService.searchIngredients("tomato", 10);

// Parse ingredient text
const structured = await IngredientService.parseIngredientText("2 cups diced tomatoes");

// Get ingredient by ID
const ingredient = await IngredientService.getIngredientById("tomato");
```

### VectorService (Phase 2)

```javascript
// Find similar ingredients
const similar = await VectorService.findSimilarIngredients("tomato", ingredientList);

// Generate embeddings
const embedding = await VectorService.generateEmbedding("fresh basil");
```

## License

[License information]

## Support

For questions, issues, or contributions:
- Create GitHub issues for bugs and feature requests
- Check existing issues before creating new ones
- Include detailed reproduction steps for bugs
- Provide context and use cases for feature requests

---

**Note**: This project uses an offline-first architecture with embedded databases. Vector features require native builds and are disabled in Expo Go for compatibility.