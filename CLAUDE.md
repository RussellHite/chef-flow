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

**IMPORTANT**: Development server must be executed on the Windows host machine, NOT through Claude Code.

### Development Server Process (Windows Only)
```bash
# Start the development server
npm start
```

### Why Windows-only:
- Expo development server requires stable network connection for device connectivity
- Metro bundler needs consistent file system access
- Real-time code reloading works best with host machine file watching
- User needs to scan QR code or connect devices manually

### Development Steps for User:
1. Run `npm start` in Windows terminal/command prompt
2. Use Expo Go app to scan QR code for testing
3. Monitor console output for any errors or warnings
4. Use `r` to reload, `d` to open developer menu

**Claude Code should NEVER attempt to run `npm start` or development server commands directly.**

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

## Server Migration Strategy (Supabase + Railway)

### Current Architecture Assessment ✅

The current codebase is **exceptionally well-designed** for migration to Supabase + Railway:

#### 🏗️ **Perfect Abstraction Layer**
- **IngredientService**: Clean interface that's data source agnostic
- **DataSource Pattern**: `EmbeddedIngredientDataSource` can be swapped for `SupabaseIngredientDataSource`
- **Dependency Injection**: Service uses constructor injection for easy swapping

#### 🔄 **Migration Strategy**

##### Phase 1: Create Supabase Data Source
- Create `SupabaseIngredientDataSource.js` implementing same interface as `EmbeddedIngredientDataSource`
- Implement vector similarity search using Supabase's pgvector extension
- Keep all business logic (parsing, similarity) in existing services

##### Phase 2: Hybrid Mode Support
- Update `ingredientServiceInstance.js` to support environment-based data source selection
- Add configuration for local vs server mode
- Enable seamless switching between embedded and server data

##### Phase 3: Vector Migration
- Move `IngredientSimilarityService` algorithms to Railway server as REST API
- Create `VectorSearchService` for server-side vector operations
- Maintain fallback to local similarity for offline mode

### Implementation Plan

#### 1. **Create Supabase Data Source** (20 min)
```javascript
// services/SupabaseIngredientDataSource.js
class SupabaseIngredientDataSource {
  async searchIngredients(query, limit) {
    // Use Supabase vector similarity search
    // Call Railway API for vector operations
  }
  
  async batchParseIngredients(ingredientTexts) {
    // Leverage server-side batch processing
  }
}
```

#### 2. **Environment Configuration** (10 min)
```javascript
// services/ingredientServiceInstance.js
const dataSource = process.env.USE_SERVER_DATA === 'true' 
  ? new SupabaseIngredientDataSource()
  : new EmbeddedIngredientDataSource();
```

#### 3. **Railway Vector API Integration** (30 min)
- Create Railway endpoints for vector similarity
- Implement embedding generation for ingredients
- Add caching layer for offline capability

#### 4. **Migration Benefits**
- **Zero Code Changes** in UI components
- **Gradual Migration** - can run hybrid mode
- **Offline Fallback** - maintains embedded functionality
- **Performance Boost** - server-side vector operations
- **Scalability** - unlimited ingredient database size

### Migration Advantages

#### ✅ **What's Already Perfect**
- Service abstraction layer ready
- Business logic separated from data access
- Consistent API interface across all operations
- Confidence scoring system transferable
- Parsing logic can remain client-side or move server-side

#### 🚀 **Easy Transition Path**
1. **Day 1**: Deploy current code unchanged
2. **Day 2**: Add Supabase data source alongside embedded
3. **Day 3**: Switch to server mode with single config change
4. **Day 4**: Enhanced vector search with pgvector + Railway

The architecture is **migration-ready by design** - excellent foresight in the service layer abstraction!

# Claude Code Development Principles for Chef-Flow Project

## Core Development Philosophy
You are working on the chef-flow application project. Follow these fundamental software engineering principles in all code you write, review, or modify:

## 1. KISS (Keep It Simple, Stupid)
- **Write straightforward, uncomplicated code** that solves the problem directly
- **Avoid clever tricks or overly complex solutions** unless absolutely necessary
- **Choose clarity over cleverness** - if there are two ways to solve a problem, pick the more readable one
- **Break complex problems into smaller, simpler parts**
- **Use descriptive variable and function names** that make the code self-documenting
- **Prefer explicit code over implicit behavior**

## 2. YAGNI (You Aren't Gonna Need It)
- **Only implement features that are currently needed** - don't build for hypothetical future requirements
- **Resist the urge to add "just in case" functionality**
- **Remove unused code, dependencies, and configuration** when you encounter it
- **Focus on the immediate requirements** rather than anticipated needs
- **If a feature isn't in the current sprint/milestone, don't build it**
- **Refactor and extend when you actually need the functionality**

## 3. Single Responsibility Principle
- **Each function should do one thing well** and have a single reason to change
- **Each module/class should have one clearly defined purpose**
- **If you can describe a function's purpose with "and", it probably does too much**
- **Separate business logic from presentation logic**
- **Separate data access from business logic**
- **Keep configuration separate from implementation**

## 4. Favor Readability and Maintainability
- **Write code as if the person maintaining it is a violent psychopath who knows where you live**
- **Use meaningful comments to explain WHY, not what** (the code should explain what)
- **Choose slightly verbose but clear code over terse but confusing code**
- **Use consistent formatting and naming conventions** throughout the project
- **Structure code in a logical, predictable way**
- **Make dependencies explicit and easy to understand**

## Specific Implementation Guidelines

### Code Structure
- **Use small, focused functions** (ideally 10-20 lines, never more than 50)
- **Limit function parameters** (3-4 max, use objects for more complex data)
- **Use clear, descriptive names** for variables, functions, and classes
- **Group related functionality** into well-organized modules
- **Keep related files together** in logical directory structures

### Error Handling
- **Handle errors explicitly** rather than ignoring them
- **Provide meaningful error messages** that help with debugging
- **Fail fast and fail clearly** when something goes wrong
- **Use consistent error handling patterns** throughout the application

### Testing and Documentation
- **Write tests for new functionality** (but don't over-engineer test coverage)
- **Include basic usage examples** in function/module documentation
- **Document any non-obvious business logic or domain-specific requirements**
- **Keep README and setup instructions current**

### Dependencies and Libraries
- **Minimize external dependencies** - only add what you actually need
- **Choose well-maintained, stable libraries** over cutting-edge alternatives
- **Document why specific libraries were chosen** for future maintainers
- **Regularly review and update dependencies** for security and compatibility

## Decision-Making Framework
When faced with implementation choices, ask yourself:

1. **Is this the simplest solution that works?**
2. **Will I actually need this flexibility/feature right now?**
3. **Does this function/module have a single, clear responsibility?**
4. **Will another developer understand this code in 6 months?**
5. **Can I explain this approach in plain English to a non-programmer?**

## Code Review Checklist
Before submitting code, ensure:
- [ ] Functions are small and focused on a single task
- [ ] Variable and function names clearly indicate their purpose
- [ ] No unnecessary complexity or premature optimization
- [ ] No features built for hypothetical future needs
- [ ] Error cases are handled appropriately
- [ ] Code follows existing project conventions
- [ ] Comments explain complex business logic, not obvious code

## Remember
**Good code is not just working code - it's code that can be easily understood, modified, and maintained by other developers (including your future self).** When in doubt, err on the side of simplicity and clarity.

The goal is to build a chef-flow application that is reliable, maintainable, and easy for the team to work with over time.