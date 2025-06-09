import React, { createContext, useContext, useState } from 'react';

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

const sampleRecipe = {
  id: 'sample-recipe-1',
  title: 'Chicken',
  originalContent: `Chicken

2 (5 ounce) skinless, boneless chicken breast halves
1 medium lemon, juiced, divided
salt and freshly ground black pepper to taste
1 tablespoon olive oil
1 pinch dried oregano
2 sprigs fresh parsley, chopped, for garnish

Place chicken in a bowl; pour 1/2 of the lemon juice over chicken and season with salt.

Heat olive oil in a medium skillet over medium-low heat. Place chicken into hot oil. Add remaining lemon juice and oregano; season with black pepper. Cook chicken until golden brown and the juices run clear, 5 to 10 minutes per side. An instant-read thermometer inserted into the center should read at least 165 degrees F (74 degrees C).

Garnish chicken with parsley to serve.`,
  servings: '2 servings',
  totalTime: '25 minutes',
  ingredients: [
    {
      id: 'ing-1',
      originalText: '2 (5 ounce) skinless, boneless chicken breast halves',
      displayText: '2 (5 ounce) skinless, boneless chicken breast halves',
      structured: {
        isStructured: true,
        quantity: 2,
        unit: { value: 'piece', name: 'piece', plural: 'pieces' },
        ingredient: { id: 'chicken-breast', name: 'chicken breast halves', category: 'meat' },
        preparation: { id: 'prep-1', name: 'skinless, boneless (5 ounce)', requiresStep: false }
      }
    },
    {
      id: 'ing-2',
      originalText: '1 medium lemon, juiced, divided',
      displayText: '1 medium lemon, juiced, divided',
      structured: {
        isStructured: true,
        quantity: 1,
        unit: { value: 'piece', name: 'piece', plural: 'pieces' },
        ingredient: { id: 'lemon', name: 'medium lemon', category: 'fruit' },
        preparation: { id: 'prep-2', name: 'juiced, divided', requiresStep: true },
        isDivided: true
      }
    },
    {
      id: 'ing-3',
      originalText: 'salt and freshly ground black pepper to taste',
      displayText: 'salt and freshly ground black pepper to taste',
      structured: {
        isStructured: true,
        quantity: null,
        unit: null,
        ingredient: { id: 'salt-pepper', name: 'salt and freshly ground black pepper', category: 'seasoning' },
        preparation: { id: 'prep-3', name: 'to taste', requiresStep: false }
      }
    },
    {
      id: 'ing-4',
      originalText: '1 tablespoon olive oil',
      displayText: '1 tablespoon olive oil',
      structured: {
        isStructured: true,
        quantity: 1,
        unit: { value: 'tbsp', name: 'tablespoon', plural: 'tablespoons' },
        ingredient: { id: 'olive-oil', name: 'olive oil', category: 'oil' },
        preparation: null
      }
    },
    {
      id: 'ing-5',
      originalText: '1 pinch dried oregano',
      displayText: '1 pinch dried oregano',
      structured: {
        isStructured: true,
        quantity: 1,
        unit: { value: 'pinch', name: 'pinch', plural: 'pinches' },
        ingredient: { id: 'oregano', name: 'dried oregano', category: 'herb' },
        preparation: null
      }
    },
    {
      id: 'ing-6',
      originalText: '2 sprigs fresh parsley, chopped, for garnish',
      displayText: '2 sprigs fresh parsley, chopped, for garnish',
      structured: {
        isStructured: true,
        quantity: 2,
        unit: { value: 'sprig', name: 'sprig', plural: 'sprigs' },
        ingredient: { id: 'parsley', name: 'fresh parsley', category: 'herb' },
        preparation: { id: 'prep-4', name: 'chopped, for garnish', requiresStep: false }
      }
    }
  ],
  steps: [
    {
      id: 'step-1',
      content: 'Place 2 pieces chicken breast halves in a bowl; pour 1/2 of the 1 piece medium lemon juice over chicken and season with salt and freshly ground black pepper.',
      timing: '2 minutes',
      ingredients: [
        { id: 'ing-1', text: '2 pieces chicken breast halves', fullText: '2 (5 ounce) skinless, boneless chicken breast halves', isFirstMention: true, firstMentionStepId: 'step-1' },
        { id: 'ing-2', text: '1 piece medium lemon', fullText: '1 medium lemon, juiced, divided', isFirstMention: true, firstMentionStepId: 'step-1' },
        { id: 'ing-3', text: 'salt and freshly ground black pepper', fullText: 'salt and freshly ground black pepper to taste', isFirstMention: true, firstMentionStepId: 'step-1' }
      ],
      ingredientTracking: { hasTrackedIngredients: true, trackingVersion: '2.0' }
    },
    {
      id: 'step-2',
      content: 'Heat 1 tablespoon olive oil in a medium skillet over medium-low heat. Place chicken breast halves into hot oil.',
      timing: '3 minutes',
      ingredients: [
        { id: 'ing-4', text: '1 tablespoon olive oil', fullText: '1 tablespoon olive oil', isFirstMention: true, firstMentionStepId: 'step-2' },
        { id: 'ing-1', text: 'chicken breast halves', fullText: '2 (5 ounce) skinless, boneless chicken breast halves', isFirstMention: false, firstMentionStepId: 'step-1' }
      ],
      ingredientTracking: { hasTrackedIngredients: true, trackingVersion: '2.0' }
    },
    {
      id: 'step-3',
      content: 'Add remaining medium lemon juice and 1 pinch dried oregano; season with salt and freshly ground black pepper. Cook chicken breast halves until golden brown and the juices run clear, 5 to 10 minutes per side. An instant-read thermometer inserted into the center should read at least 165 degrees F (74 degrees C).',
      timing: '15-20 minutes',
      ingredients: [
        { id: 'ing-2', text: 'medium lemon', fullText: '1 medium lemon, juiced, divided', isFirstMention: false, firstMentionStepId: 'step-1' },
        { id: 'ing-5', text: '1 pinch dried oregano', fullText: '1 pinch dried oregano', isFirstMention: true, firstMentionStepId: 'step-3' },
        { id: 'ing-3', text: 'salt and freshly ground black pepper', fullText: 'salt and freshly ground black pepper to taste', isFirstMention: false, firstMentionStepId: 'step-1' },
        { id: 'ing-1', text: 'chicken breast halves', fullText: '2 (5 ounce) skinless, boneless chicken breast halves', isFirstMention: false, firstMentionStepId: 'step-1' }
      ],
      ingredientTracking: { hasTrackedIngredients: true, trackingVersion: '2.0' }
    },
    {
      id: 'step-4',
      content: 'Garnish chicken breast halves with 2 sprigs fresh parsley to serve.',
      timing: '1 minute',
      ingredients: [
        { id: 'ing-1', text: 'chicken breast halves', fullText: '2 (5 ounce) skinless, boneless chicken breast halves', isFirstMention: false, firstMentionStepId: 'step-1' },
        { id: 'ing-6', text: '2 sprigs fresh parsley', fullText: '2 sprigs fresh parsley, chopped, for garnish', isFirstMention: true, firstMentionStepId: 'step-4' }
      ],
      ingredientTracking: { hasTrackedIngredients: true, trackingVersion: '2.0' }
    }
  ],
  ingredientTracker: {
    'ing-1': { firstMentionStepId: 'step-1', stepOrder: 0, amount: 2, unit: { name: 'pieces' } },
    'ing-2': { firstMentionStepId: 'step-1', stepOrder: 0, amount: 1, unit: { name: 'piece' } },
    'ing-3': { firstMentionStepId: 'step-1', stepOrder: 0, amount: null, unit: null },
    'ing-4': { firstMentionStepId: 'step-2', stepOrder: 1, amount: 1, unit: { name: 'tablespoon' } },
    'ing-5': { firstMentionStepId: 'step-3', stepOrder: 2, amount: 1, unit: { name: 'pinch' } },
    'ing-6': { firstMentionStepId: 'step-4', stepOrder: 3, amount: 2, unit: { name: 'sprigs' } }
  }
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([sampleRecipe]);

  const addRecipe = (recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  const updateRecipe = (updatedRecipe) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    );
  };

  const deleteRecipe = (recipeId) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  const value = {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};