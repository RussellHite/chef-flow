import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipeContext = createContext();
const RECIPES_STORAGE_KEY = 'chef-flow-recipes';

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
      content: 'Place chicken in a bowl; pour 1/2 of the lemon juice over chicken and season with salt.',
      timing: '2 minutes',
      ingredients: ['ing-1', 'ing-2', 'ing-3']
    },
    {
      id: 'step-2',
      content: 'Heat olive oil in a medium skillet over medium-low heat. Place chicken into hot oil.',
      timing: '3 minutes',
      ingredients: ['ing-4']
    },
    {
      id: 'step-3',
      content: 'Add remaining lemon juice and oregano; season with black pepper. Cook chicken until golden brown and the juices run clear, 5 to 10 minutes per side. An instant-read thermometer inserted into the center should read at least 165 degrees F (74 degrees C).',
      timing: '15-20 minutes',
      ingredients: ['ing-2', 'ing-5', 'ing-3']
    },
    {
      id: 'step-4',
      content: 'Garnish chicken with parsley to serve.',
      timing: '1 minute',
      ingredients: ['ing-6']
    }
  ]
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recipes from AsyncStorage on mount
  useEffect(() => {
    loadRecipes();
  }, []);

  // Save recipes to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading && recipes.length > 0) {
      saveRecipes();
    }
  }, [recipes, isLoading]);

  const loadRecipes = async () => {
    try {
      const savedRecipes = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
      if (savedRecipes) {
        const parsedRecipes = JSON.parse(savedRecipes);
        console.log(`Loaded ${parsedRecipes.length} recipes from storage`);
        setRecipes(parsedRecipes);
      } else {
        // First time - use sample recipe
        console.log('No saved recipes found, using sample recipe');
        setRecipes([sampleRecipe]);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      // Fallback to sample recipe on error
      setRecipes([sampleRecipe]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipes = async () => {
    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
      console.log(`Saved ${recipes.length} recipes to storage`);
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

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
    isLoading,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};