# Chef Flow React Native App

## Project Overview
Chef Flow is a React Native application built with Expo that helps users convert traditional recipes into step-by-step cooking flows with structured ingredient management.

## Architecture
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Tab + Stack navigators)
- **State Management**: React Context API
- **Data**: Embedded ingredient database with offline-first architecture

## Key Features
- Recipe parsing with intelligent ingredient detection
- Structured ingredient display with quantity, unit, ingredient name, and preparation
- Step-by-step cooking flow editor
- Admin interface with ingredient database management
- Support for complex ingredient specifications (e.g., "2 (5 ounce) cans")
- "Divided" ingredient handling for recipes that split ingredients across steps

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Testing
- Test framework: Not yet configured
- To run tests: Please specify test command for future reference

## Deployment
**IMPORTANT**: EAS builds must be executed on the Windows host machine, NOT through Claude Code.

### APK Build Process (Windows Only)
```bash
# Build Android APK for testing
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production
```

### Why Windows-only:
- EAS build requires stable internet connection and proper authentication
- Build process can take 5-10 minutes and may timeout in Claude environment
- User needs to monitor build progress and download APK manually
- Authentication tokens and build configurations are user-specific

### Deployment Steps for User:
1. Run `eas build --platform android --profile preview` in Windows terminal
2. Monitor build progress via provided URL
3. Download APK when build completes
4. Install APK on Android device for testing

**Claude Code should NEVER attempt to run EAS build commands directly.**

## File Structure
- `/screens/` - Main application screens
- `/components/` - Reusable UI components
- `/navigation/` - Navigation configuration
- `/services/` - Business logic and data access
- `/data/` - Embedded ingredient database
- `/utils/` - Utility functions including recipe parser
- `/styles/` - Shared styling (colors, typography, common styles)

## Key Components
- **IngredientListScreen**: Admin interface for viewing ingredient database
- **EditRecipeScreen**: Recipe editing with Flow and Old Guard tabs
- **AddRecipeScreen**: Recipe input and initial parsing
- **StructuredIngredient**: Component for displaying parsed ingredients

## Services
- **IngredientService**: Abstraction layer for ingredient operations
- **EmbeddedIngredientDataSource**: Local ingredient database implementation

## Notes
- Ingredients support complex parsing including parenthetical sizes and preparation methods
- Admin interface uses wrapping category filters and reduced padding for consistency
- Recipe parser handles "divided" ingredients and distinguishes between forms vs prep actions