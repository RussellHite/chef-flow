import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import StepEditor from '../components/StepEditor';
import StructuredIngredient from '../components/StructuredIngredient';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useRecipes } from '../contexts/RecipeContext';
import { updateIngredientTracking } from '../services/IngredientTrackingService';
import { useRecipeCreationTracking } from '../hooks/useIngredientTracking';

// Helper functions for ingredient parsing
const extractAmount = (ingredientText) => {
  const match = ingredientText.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)/i);
  return match ? `${match[1]} ${match[2]}` : '';
};

const extractName = (ingredientText) => {
  const match = ingredientText.match(/^(\d+(?:[-–]\d+)?(?:\s+to\s+\d+)?(?:\/\d+)?(?:\.\d+)?(?:\s*\([^)]+\))?)\s*(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|whole|medium|large|small|cans?|packages?|boxes?|containers?)\s+(.+)/i);
  return match ? match[3] : ingredientText;
};

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe, originalContent, isNew, fromHome } = route.params;
  const { updateRecipe, deleteRecipe } = useRecipes();
  const [editedRecipe, setEditedRecipe] = useState(recipe);
  const [ingredients, setIngredients] = useState(
    recipe.ingredients ? recipe.ingredients : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [originalStepContent, setOriginalStepContent] = useState(new Map());
  const [newIngredientEditing, setNewIngredientEditing] = useState(false);
  const [tempNewIngredient, setTempNewIngredient] = useState(null);
  
  // Initialize ingredient tracking for recipe editing
  const tracking = useRecipeCreationTracking();

  useEffect(() => {
    navigation.setOptions({
      title: isNew ? 'Review Recipe' : 'Edit Recipe',
      headerLeft: fromHome ? undefined : () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
      headerRight: !isNew ? () => (
        <TouchableOpacity onPress={handleDeleteRecipe} style={styles.headerButton}>
          <Ionicons name="trash" size={24} color={colors.surface} />
        </TouchableOpacity>
      ) : undefined,
    });
    
    // Store original step content on first load
    if (editedRecipe.steps && originalStepContent.size === 0) {
      const originalContent = new Map();
      editedRecipe.steps.forEach(step => {
        originalContent.set(step.id, step.content);
      });
      setOriginalStepContent(originalContent);
    }
  }, [navigation, isNew, fromHome, editedRecipe.steps, originalStepContent.size]);

  // Sync ingredients with main recipe and apply tracking if needed
  useEffect(() => {
    // Check if recipe needs ingredient tracking migration
    const needsTracking = editedRecipe.steps && 
                         editedRecipe.steps.length > 0 && 
                         editedRecipe.steps.some(step => 
                           step.ingredients && 
                           step.ingredients.length > 0 && 
                           typeof step.ingredients[0] === 'string'
                         );
    
    if (needsTracking && ingredients.length > 0) {
      try {
        // Apply ingredient tracking to existing recipe
        const { steps: trackedSteps, ingredientTracker } = updateIngredientTracking(editedRecipe.steps, ingredients);
        
        // Also update step content with amounts
        const stepsWithUpdatedContent = trackedSteps.map((step, stepIndex) => {
          let updatedContent = step.content;
          
          if (step.ingredients && Array.isArray(step.ingredients)) {
            step.ingredients.forEach(ingredientRef => {
              if (ingredientRef && typeof ingredientRef === 'object' && 
                  ingredientRef.isFirstMention && ingredientRef.id) {
                
                const ingredient = ingredients.find(ing => ing.id === ingredientRef.id);
                if (!ingredient) return;
                
                const ingredientName = ingredient.structured?.ingredient?.name;
                if (!ingredientName) return;
                
                // Build simple spec
                let simpleSpec = '';
                const quantity = ingredient.structured?.quantity;
                const unit = ingredient.structured?.unit;
                
                if (quantity !== null && quantity !== undefined) {
                  simpleSpec += quantity + ' ';
                }
                
                if (unit) {
                  const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
                  simpleSpec += unitName + ' ';
                }
                
                simpleSpec += ingredientName;
                
                // Replace in step content
                const regex = new RegExp(`\\b${ingredientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                if (regex.test(updatedContent) && simpleSpec.trim() !== ingredientName) {
                  updatedContent = updatedContent.replace(regex, simpleSpec.trim());
                }
              }
            });
          }
          
          return {
            ...step,
            content: updatedContent
          };
        });
        
        setEditedRecipe(prev => ({
          ...prev,
          ingredients: ingredients,
          steps: stepsWithUpdatedContent,
          ingredientTracker
        }));
      } catch (error) {
        console.warn('Error applying ingredient tracking:', error);
        // Fallback to simple update
        setEditedRecipe(prev => ({
          ...prev,
          ingredients: ingredients
        }));
      }
    } else {
      setEditedRecipe(prev => ({
        ...prev,
        ingredients: ingredients
      }));
    }
  }, [ingredients]);

  const handleStepUpdate = (stepId, updatedStep) => {
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? updatedStep : step
      ),
    }));
  };

  const handleStepReorder = (fromIndex, toIndex) => {
    const newSteps = [...editedRecipe.steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const handleAddStep = (afterIndex) => {
    const newStep = {
      id: `step_${Date.now()}`,
      content: '',
      timing: null,
      ingredients: [],
    };

    const newSteps = [...editedRecipe.steps];
    newSteps.splice(afterIndex + 1, 0, newStep);
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const handleCreateStepFromAction = (stepContent, ingredientId) => {
    const newStep = {
      id: `step_${Date.now()}`,
      content: stepContent,
      timing: null,
      ingredients: [ingredientId],
    };

    // Store the original content for this new step BEFORE adding to recipe
    setOriginalStepContent(prev => {
      const updated = new Map(prev);
      updated.set(newStep.id, stepContent);
      return updated;
    });

    setEditedRecipe(prev => ({
      ...prev,
      steps: [newStep, ...prev.steps],
    }));
    
    // Don't trigger updateAllStepsContent here since the step already has the right content
    // The step content from action parsing already includes the amount
  };

  const handleDeleteStep = (stepId) => {
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEditedRecipe(prev => ({
              ...prev,
              steps: prev.steps.filter(step => step.id !== stepId),
            }));
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement recipe saving logic
      await saveRecipe(editedRecipe, isNew);
      
      // Track recipe completion
      if (tracking.isInitialized && ingredients.length > 0) {
        await tracking.trackRecipeCompleted(ingredients, {
          name: editedRecipe.title,
          id: editedRecipe.id || `recipe_${Date.now()}`,
          totalIngredients: ingredients.length,
          totalSteps: editedRecipe.steps?.length || 0,
          isComplete: true,
          source: isNew ? 'recipe_creation' : 'recipe_edit'
        });
      }
      
      if (isNew) {
        navigation.navigate('Home', { 
          newRecipe: { ...editedRecipe, originalContent },
          showSuccess: true 
        });
      } else {
        // Update existing recipe in context
        updateRecipe({ ...editedRecipe, originalContent });
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to go back?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleDeleteRecipe = () => {
    Alert.alert(
      'Delete Recipe?',
      `Are you sure you want to delete "${editedRecipe.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Recipe',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(editedRecipe.id);
            navigation.navigate('Recipes');
          },
        },
      ]
    );
  };

  // Temporary save function - will be enhanced with persistent storage
  const saveRecipe = async (recipe, isNew) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Recipe saved:', recipe.title);
  };

  const calculateTotalTime = () => {
    return editedRecipe.steps.reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);
  };


  const handleIngredientEdit = async (ingredient, newText) => {
    console.log('🔧 EditRecipeScreen handleIngredientEdit:', {
      ingredientId: ingredient.id,
      originalText: ingredient.originalText,
      newText,
      isStructured: !!ingredient.structured
    });
    
    try {
      let updatedIngredient;
      
      // Track ingredient correction/edit
      if (tracking.isInitialized && newText && newText.trim() !== ingredient.originalText) {
        const correctionType = ingredient.structured ? 'refinement' : 'text_edit';
        await tracking.trackCorrection(
          { name: ingredient.originalText || ingredient.displayText, text: ingredient.originalText },
          { name: newText.trim(), text: newText.trim() },
          correctionType
        );
      }
      
      // Check if this is already a structured ingredient object (from manual training)
      if (typeof ingredient === 'object' && ingredient.structured && newText) {
        // Re-parse the edited text to update the structured data
        try {
          const structured = await import('../services/ingredientServiceInstance.js')
            .then(module => module.default.parseIngredientText(newText.trim()));
          
          // Extract the ingredient name from the edited text
          // This preserves what the user typed instead of relying on database matches
          const textParts = newText.trim().split(/\s+/);
          let userIngredientName = '';
          
          // Skip quantity and unit to find the ingredient name
          let startIndex = 0;
          // Skip quantity (numbers, fractions, decimals)
          if (textParts[0] && /^\d/.test(textParts[0])) {
            startIndex = 1;
          }
          // Skip unit if present
          if (textParts[startIndex] && structured.unit && 
              (textParts[startIndex].toLowerCase() === structured.unit.name?.toLowerCase() ||
               textParts[startIndex].toLowerCase() === structured.unit.plural?.toLowerCase())) {
            startIndex++;
          }
          
          // Extract ingredient name (everything after quantity and unit, before comma)
          const remainingText = textParts.slice(startIndex).join(' ');
          const commaIndex = remainingText.indexOf(',');
          userIngredientName = commaIndex > -1 
            ? remainingText.substring(0, commaIndex).trim()
            : remainingText.trim();
          
          // Override the parsed ingredient name with what the user typed
          if (userIngredientName) {
            structured.ingredient = {
              id: 'custom',
              name: userIngredientName,
              category: 'custom'
            };
          }
          
          updatedIngredient = {
            ...ingredient,
            originalText: newText.trim(),
            structured: structured,
            displayText: structured.isStructured 
              ? await import('../services/ingredientServiceInstance.js')
                  .then(module => module.default.formatIngredientForDisplay(structured))
              : newText.trim()
          };
          
          setIngredients(prev => 
            prev.map(ing => ing.id === ingredient.id ? updatedIngredient : ing)
          );
        } catch (error) {
          console.warn('Error parsing structured ingredient:', error);
          // Fallback to updating just the text
          updatedIngredient = {
            ...ingredient,
            originalText: newText.trim(),
            displayText: newText.trim()
          };
          
          setIngredients(prev => 
            prev.map(ing => ing.id === ingredient.id ? updatedIngredient : ing)
          );
        }
      } else if (newText && newText.trim()) {
        // Original parsing logic for text-based edits
        try {
          // Re-parse the ingredient text
          const structured = await import('../services/ingredientServiceInstance.js')
            .then(module => module.default.parseIngredientText(newText.trim()));
          
          // Extract the ingredient name from the edited text
          // This preserves what the user typed instead of relying on database matches
          const textParts = newText.trim().split(/\s+/);
          let userIngredientName = '';
          
          // Skip quantity and unit to find the ingredient name
          let startIndex = 0;
          // Skip quantity (numbers, fractions, decimals)
          if (textParts[0] && /^\d/.test(textParts[0])) {
            startIndex = 1;
          }
          // Skip unit if present
          if (textParts[startIndex] && structured.unit && 
              (textParts[startIndex].toLowerCase() === structured.unit.name?.toLowerCase() ||
               textParts[startIndex].toLowerCase() === structured.unit.plural?.toLowerCase())) {
            startIndex++;
          }
          
          // Extract ingredient name (everything after quantity and unit, before comma)
          const remainingText = textParts.slice(startIndex).join(' ');
          const commaIndex = remainingText.indexOf(',');
          userIngredientName = commaIndex > -1 
            ? remainingText.substring(0, commaIndex).trim()
            : remainingText.trim();
          
          // Override the parsed ingredient name with what the user typed
          if (userIngredientName) {
            structured.ingredient = {
              id: 'custom',
              name: userIngredientName,
              category: 'custom'
            };
          }
          
          updatedIngredient = {
            ...ingredient,
            originalText: newText.trim(),
            structured: structured,
            displayText: structured.isStructured 
              ? await import('../services/ingredientServiceInstance.js')
                  .then(module => module.default.formatIngredientForDisplay(structured))
              : newText.trim()
          };
          
          setIngredients(prev => 
            prev.map(ing => ing.id === ingredient.id ? updatedIngredient : ing)
          );
        } catch (error) {
          console.warn('Error parsing ingredient:', error);
          // Fallback to simple text update
          updatedIngredient = {
            ...ingredient,
            originalText: newText.trim(),
            structured: null,
            displayText: newText.trim()
          };
          
          setIngredients(prev => 
            prev.map(ing => ing.id === ingredient.id ? updatedIngredient : ing)
          );
        }
      }

      // Schedule a comprehensive step content update after ingredient change
      if (updatedIngredient) {
        console.log('🔧 Scheduling step update with ingredient:', updatedIngredient.id);
        // Use a debounced update to handle multiple rapid changes
        clearTimeout(window.stepUpdateTimeout);
        window.stepUpdateTimeout = setTimeout(() => {
          try {
            // Pass the updated ingredient to ensure we use the latest data
            updateAllStepsContent(updatedIngredient);
          } catch (stepError) {
            console.warn('Error updating steps content:', stepError);
          }
        }, 200); // 200ms delay to batch multiple changes
      }
    } catch (error) {
      console.error('Error in handleIngredientEdit:', error);
      Alert.alert('Error', 'Failed to update ingredient. Please try again.');
    }
  };

  const updateAllStepsContent = (updatedIngredient = null) => {
    setEditedRecipe(prev => {
      if (!prev.steps || !ingredients) return prev;
      
      console.log('Updating all steps content from original...', updatedIngredient ? `with updated ingredient: ${updatedIngredient.id}` : 'using current state');
      
      // Create a new Map with current original content, adding missing entries
      const currentOriginalContent = new Map(originalStepContent);
      prev.steps.forEach(step => {
        if (!currentOriginalContent.has(step.id)) {
          // Clean any existing duplications before storing as original
          let cleanContent = step.content;
          
          // Remove obvious duplications like "1 1 lemon" -> "1 lemon" or "2 sprigs 2 sprigs parsley" -> "2 sprigs parsley"
          cleanContent = cleanContent.replace(/(\b\d+(?:\.\d+)?\s+(?:cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|sprigs?|pinch|pinches?|whole|medium|large|small|cans?|packages?|boxes?|containers?)\s+)\1+/gi, '$1');
          
          // Remove number duplications like "1 1 lemon" -> "1 lemon"
          cleanContent = cleanContent.replace(/(\b\d+(?:\.\d+)?)\s+\1+(\s+\w+)/gi, '$1$2');
          
          currentOriginalContent.set(step.id, cleanContent);
        }
      });
      
      // Update the originalStepContent state with new entries
      if (currentOriginalContent.size > originalStepContent.size) {
        setOriginalStepContent(currentOriginalContent);
      }
      
      // Track which ingredients have been mentioned
      const ingredientMentions = new Map(); // ingredientName -> first step index
      
      const updatedSteps = prev.steps.map((step, stepIndex) => {
        // Always start from the original content to prevent accumulation
        const originalContent = currentOriginalContent.get(step.id) || step.content;
        let updatedContent = originalContent;
        
        console.log(`Processing step ${stepIndex + 1}: "${originalContent}"`);
        
        // Special handling for action-generated steps
        // These are steps that were created from ingredient actions and have a single ingredient
        const isActionGeneratedStep = step.ingredients && step.ingredients.length === 1;
        
        console.log(`🔧 Step ${stepIndex + 1} debug:`, {
          stepId: step.id,
          isActionGenerated: isActionGeneratedStep,
          stepIngredients: step.ingredients,
          hasUpdatedIngredient: !!updatedIngredient,
          updatedIngredientId: updatedIngredient?.id
        });
        
        if (isActionGeneratedStep && updatedIngredient) {
          const stepIngredient = step.ingredients[0];
          // Handle both string IDs and object formats
          const stepIngredientId = typeof stepIngredient === 'string' ? stepIngredient : stepIngredient?.id;
          
          console.log(`🔧 Comparing ingredient IDs: step=${stepIngredientId}, updated=${updatedIngredient.id}`);
          
          // Check if this step was generated from the updated ingredient
          if (stepIngredientId === updatedIngredient.id) {
            console.log(`🔧 MATCH! Updating action-generated step for ingredient: ${updatedIngredient.id}`);
            
            // Rebuild the step content with updated ingredient data
            const ingredient = updatedIngredient;
            console.log(`🔧 Ingredient preparation data:`, {
              hasStructured: !!ingredient.structured,
              hasPreparation: !!ingredient.structured?.preparation,
              preparationName: ingredient.structured?.preparation?.name,
              fullIngredient: ingredient
            });
            
            if (ingredient.structured?.preparation?.name) {
              const preparation = ingredient.structured.preparation.name;
              
              // Extract action words from preparation (like "chopped", "diced", etc.)
              let actionMatch = preparation.match(/^(chopped|diced|sliced|minced|grated|shredded|peeled|crushed|juiced|zested|squeezed|mashed|pureed|blended|whipped|beaten|mixed|stirred|heated|cooked|boiled|fried|roasted|baked|grilled|steamed|sautéed)/i);
              console.log(`🔧 Action match from preparation:`, { preparation, actionMatch });
              
              // If no action found in preparation, try to infer from step content
              if (!actionMatch) {
                const stepContent = originalContent.toLowerCase();
                const stepActionMatch = stepContent.match(/^(chop|dice|slice|mince|grate|shred|peel|crush|juice|zest|squeeze|mash|puree|blend|whip|beat|mix|stir|heat|cook|boil|fry|roast|bake|grill|steam|sauté)\s/i);
                if (stepActionMatch) {
                  actionMatch = [stepActionMatch[0], stepActionMatch[1]];
                  console.log(`🔧 Action inferred from step content:`, { stepContent, actionMatch });
                }
              }
              
              if (actionMatch) {
                const action = actionMatch[1];
                const quantity = ingredient.structured.quantity;
                const unit = ingredient.structured.unit;
                const ingredientName = ingredient.structured.ingredient?.name;
                
                // Rebuild step content like "Chop 2 medium onions"
                let newStepContent = '';
                
                // Convert action to present tense and capitalize
                const presentTenseAction = convertToPresentTense(action);
                newStepContent += presentTenseAction.charAt(0).toUpperCase() + presentTenseAction.slice(1) + ' ';
                
                // Add quantity and unit
                if (quantity !== null && quantity !== undefined) {
                  newStepContent += quantity + ' ';
                }
                
                if (unit) {
                  const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
                  newStepContent += unitName + ' ';
                }
                
                // Add ingredient name
                if (ingredientName) {
                  newStepContent += ingredientName;
                }
                
                updatedContent = newStepContent.trim();
                console.log(`🔧 Rebuilt action step content: "${updatedContent}"`);
                
                // Update the stored original content so future updates work correctly
                currentOriginalContent.set(step.id, updatedContent);
              } else {
                console.log(`🔧 No action match found in preparation: "${preparation}"`);
              }
            } else {
              console.log(`🔧 No preparation data found, trying to infer action from step content`);
              // Even without preparation, try to infer action from step content
              const stepContent = originalContent.toLowerCase();
              const stepActionMatch = stepContent.match(/^(chop|dice|slice|mince|grate|shred|peel|crush|juice|zest|squeeze|mash|puree|blend|whip|beat|mix|stir|heat|cook|boil|fry|roast|bake|grill|steam|sauté)\s/i);
              if (stepActionMatch) {
                const action = stepActionMatch[1];
                const quantity = ingredient.structured.quantity;
                const unit = ingredient.structured.unit;
                const ingredientName = ingredient.structured.ingredient?.name;
                
                console.log(`🔧 Rebuilding step from inferred action:`, { action, quantity, unit, ingredientName });
                
                // Rebuild step content like "Juice 2 lemons"
                let newStepContent = '';
                
                // Convert action to present tense and capitalize
                const presentTenseAction = convertToPresentTense(action);
                newStepContent += presentTenseAction.charAt(0).toUpperCase() + presentTenseAction.slice(1) + ' ';
                
                // Add quantity and unit
                if (quantity !== null && quantity !== undefined) {
                  newStepContent += quantity + ' ';
                }
                
                if (unit) {
                  const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
                  newStepContent += unitName + ' ';
                }
                
                // Add ingredient name
                if (ingredientName) {
                  newStepContent += ingredientName;
                }
                
                updatedContent = newStepContent.trim();
                console.log(`🔧 Rebuilt action step content from inferred action: "${updatedContent}"`);
                
                // Update the stored original content so future updates work correctly
                currentOriginalContent.set(step.id, updatedContent);
              }
            }
          } else {
            console.log(`🔧 No ingredient ID match: step=${stepIngredientId}, updated=${updatedIngredient.id}`);
          }
        }
        
        // Create ingredients list with updated ingredient if provided
        const currentIngredients = updatedIngredient 
          ? ingredients.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing)
          : ingredients;
        
        // Process each ingredient to see if it's mentioned in this step
        currentIngredients.forEach(ingredient => {
          if (!ingredient.structured?.ingredient?.name) return;
          
          const ingredientName = ingredient.structured.ingredient.name;
          console.log(`🔧 Processing ingredient: ${ingredientName}, quantity: ${ingredient.structured.quantity}`);
          const regex = new RegExp(`\\b${ingredientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          
          if (regex.test(updatedContent)) {
            const isFirstMention = !ingredientMentions.has(ingredientName);
            
            console.log(`Found "${ingredientName}" in step ${stepIndex + 1}, first mention: ${isFirstMention}`);
            
            if (isFirstMention) {
              // Mark as mentioned and build full spec
              ingredientMentions.set(ingredientName, stepIndex);
              
              // Check if the step already has amount/unit before the ingredient name
              // This prevents duplicate replacements in action-generated steps
              const quantity = ingredient.structured.quantity;
              const unit = ingredient.structured.unit;
              
              // More flexible pattern matching - look for any number + optional unit + ingredient
              const escapedIngredientName = ingredientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              
              // Pattern 1: Exact quantity + unit + ingredient
              let exactPattern = '';
              if (quantity !== null && quantity !== undefined) {
                exactPattern += quantity.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*';
              }
              if (unit) {
                const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
                exactPattern += unitName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*';
              }
              const exactMatch = exactPattern && 
                new RegExp(exactPattern + escapedIngredientName, 'i').test(updatedContent);
              
              // Pattern 2: Any number + any unit + ingredient (for action-generated steps)
              const anyAmountPattern = new RegExp(
                '\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d+)?\\s+(?:' +
                'cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|sprigs?|pinch|pinches?|whole|medium|large|small|cans?|packages?|boxes?|containers?' +
                ')\\s+' + escapedIngredientName, 'i'
              );
              const generalMatch = anyAmountPattern.test(updatedContent);
              
              const alreadyHasAmount = exactMatch || generalMatch;
              
              console.log(`Amount check for "${ingredientName}": exact=${exactMatch}, general=${generalMatch}, content="${updatedContent}"`);
              
              if (!alreadyHasAmount) {
                // Build amount + unit + name
                let simpleSpec = '';
                
                if (quantity !== null && quantity !== undefined) {
                  simpleSpec += quantity + ' ';
                }
                
                if (unit) {
                  const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
                  simpleSpec += unitName + ' ';
                }
                
                simpleSpec += ingredientName;
                
                // Replace with full specification
                updatedContent = updatedContent.replace(regex, simpleSpec.trim());
                console.log(`Replaced with: "${simpleSpec.trim()}", result: "${updatedContent}"`);
              } else {
                console.log(`Step already has amount for "${ingredientName}", skipping replacement`);
              }
            }
            // For subsequent mentions, leave as just the ingredient name (no replacement needed)
          }
        });
        
        return {
          ...step,
          content: updatedContent
        };
      });
      
      return {
        ...prev,
        steps: updatedSteps
      };
    });
  };

  const updateStepsWithIngredient = (originalIngredient, updatedIngredient) => {
    const originalName = getIngredientName(originalIngredient);
    const newDisplayText = getIngredientDisplayText(updatedIngredient);
    
    // Build simple amount + unit + name format for step content
    let simpleSpec = '';
    if (updatedIngredient.structured) {
      const quantity = updatedIngredient.structured.quantity;
      const unit = updatedIngredient.structured.unit;
      const ingredientName = updatedIngredient.structured.ingredient?.name || originalName;
      
      // Add quantity if it exists
      if (quantity !== null && quantity !== undefined) {
        simpleSpec += quantity + ' ';
      }
      
      // Add unit if it exists
      if (unit) {
        const unitName = quantity === 1 ? (unit.name || unit.value) : (unit.plural || unit.name || unit.value);
        simpleSpec += unitName + ' ';
      }
      
      // Add ingredient name
      simpleSpec += ingredientName;
    } else {
      simpleSpec = newDisplayText || originalName;
    }
    
    // Track which steps have already mentioned this ingredient
    const usedInSteps = new Set();
    
    // Store the updated steps separately to avoid intermediate state issues
    const updatedSteps = [];
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) => {
        if (step.ingredients && step.ingredients.length > 0) {
          const hasThisIngredient = step.ingredients.some(stepIngredient => 
            isIngredientMatch(stepIngredient, originalName)
          );
          
          if (hasThisIngredient) {
            const isFirstMention = !usedInSteps.has(originalName);
            usedInSteps.add(originalName);
            
            // Update step content to show amount on first mention
            let updatedContent = step.content;
            if (originalName && originalName.length > 2) {
              const ingredientRegex = new RegExp(`\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
              
              // Check if this ingredient appears in the step content
              if (ingredientRegex.test(updatedContent)) {
                const simpleSpecTrimmed = simpleSpec.trim();
                
                // More comprehensive duplicate detection
                const hasExactSpec = updatedContent.includes(simpleSpecTrimmed);
                
                // Check for any number followed by units followed by this ingredient
                const quantityPattern = new RegExp(`\\d+(?:\\.\\d+)?(?:\\s*[-/]\\s*\\d+(?:\\.\\d+)?)?`, 'g');
                const unitPattern = `(?:cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|kg|ml|liters?|gallons?|quarts?|pints?|cloves?|pieces?|pinch|sprigs?|cans?|packages?)`;
                const amountBeforeIngredient = new RegExp(`\\d+[^.!?]*?${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
                
                const alreadyHasAmount = hasExactSpec || amountBeforeIngredient.test(updatedContent);
                
                console.log('Duplicate check for', originalName, ':', {
                  stepContent: updatedContent,
                  simpleSpec: simpleSpecTrimmed,
                  hasExactSpec,
                  alreadyHasAmount,
                  isFirstMention
                });
                
                if (isFirstMention && !alreadyHasAmount) {
                  // First mention: replace plain ingredient name with amount + unit + name
                  updatedContent = updatedContent.replace(ingredientRegex, simpleSpecTrimmed);
                  console.log('Replaced with amount:', updatedContent);
                } else if (!isFirstMention && !alreadyHasAmount) {
                  // Subsequent mentions: ensure just ingredient name (no change needed if already plain)
                  const justName = updatedIngredient.structured?.ingredient?.name || originalName;
                  updatedContent = updatedContent.replace(ingredientRegex, justName);
                }
                // If alreadyHasAmount is true, don't modify the content
              }
            }
            
            // Update step ingredients array
            const updatedStepIngredients = step.ingredients.map(stepIngredient => {
              if (isIngredientMatch(stepIngredient, originalName)) {
                return {
                  id: updatedIngredient.id,
                  text: isFirstMention ? simpleSpec.trim() : (updatedIngredient.structured?.ingredient?.name || originalName),
                  fullText: newDisplayText,
                  isFirstMention: isFirstMention,
                  firstMentionStepId: isFirstMention ? step.id : null
                };
              }
              return stepIngredient;
            });
            
            return {
              ...step,
              content: updatedContent,
              ingredients: updatedStepIngredients
            };
          }
        }
        return step;
      })
    }));
  };

  const getIngredientName = (ingredient) => {
    if (ingredient.structured && ingredient.structured.ingredient) {
      return ingredient.structured.ingredient.name;
    }
    if (ingredient.displayText) {
      return ingredient.displayText;
    }
    if (ingredient.originalText) {
      return ingredient.originalText;
    }
    return '';
  };

  const getIngredientDisplayText = (ingredient) => {
    if (ingredient.structured && ingredient.structured.isStructured) {
      const { quantity, unit, ingredient: baseIngredient, preparation } = ingredient.structured;
      let display = '';
      
      if (quantity !== null) {
        display += formatQuantity(quantity) + ' ';
      }
      if (unit) {
        const unitName = quantity === 1 ? unit.name : unit.plural;
        display += unitName + ' ';
      }
      if (baseIngredient) {
        display += baseIngredient.name;
      }
      if (preparation) {
        display += ', ' + preparation.name;
      }
      
      return display.trim();
    }
    
    return ingredient.displayText || ingredient.originalText || '';
  };

  const formatQuantity = (quantity) => {
    // Common cooking fractions
    const fractions = {
      0.125: '1/8',
      0.25: '1/4',
      0.333: '1/3',
      0.5: '1/2',
      0.667: '2/3',
      0.75: '3/4'
    };
    
    const whole = Math.floor(quantity);
    const decimal = quantity - whole;
    
    // Check if decimal part matches a common fraction
    for (const [value, fraction] of Object.entries(fractions)) {
      if (Math.abs(decimal - parseFloat(value)) < 0.02) {
        return whole > 0 ? `${whole} ${fraction}` : fraction;
      }
    }
    
    // Return as decimal or whole number
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  };

  const isIngredientMatch = (stepIngredient, ingredientName) => {
    if (!stepIngredient || !ingredientName) return false;
    
    // Handle both string and object formats
    let stepIngredientText = '';
    if (typeof stepIngredient === 'string') {
      stepIngredientText = stepIngredient;
    } else if (typeof stepIngredient === 'object' && stepIngredient.text) {
      stepIngredientText = stepIngredient.text;
    } else {
      return false;
    }
    
    const stepIngredientLower = stepIngredientText.toLowerCase();
    const ingredientNameLower = ingredientName.toLowerCase();
    
    // Direct match
    if (stepIngredientLower.includes(ingredientNameLower) || ingredientNameLower.includes(stepIngredientLower)) {
      return true;
    }
    
    // Word-by-word matching for compound ingredients
    const stepWords = stepIngredientLower.split(/\s+/);
    const ingredientWords = ingredientNameLower.split(/\s+/);
    
    // Check if most ingredient words are present in step ingredient
    const matchingWords = ingredientWords.filter(word => 
      stepWords.some(stepWord => stepWord.includes(word) || word.includes(stepWord))
    );
    
    return matchingWords.length >= Math.min(2, ingredientWords.length);
  };

  const handleIngredientDelete = (ingredient) => {
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to delete this ingredient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Track ingredient removal
            if (tracking.isInitialized) {
              await tracking.trackIngredientRemoved(ingredient, {
                recipeId: editedRecipe.id,
                recipeName: editedRecipe.title,
                reason: 'user_delete'
              });
            }
            
            setIngredients(prev => prev.filter(ing => ing.id !== ingredient.id));
            
            // Remove ingredient from steps
            removeIngredientFromSteps(ingredient);
          },
        },
      ]
    );
  };

  const handleAddIngredient = () => {
    // Create a temporary new ingredient with default values
    const newIngredient = {
      id: `ingredient_new_${Date.now()}`,
      originalText: '',
      displayText: '',
      structured: {
        quantity: 1,
        unit: null,
        ingredient: { id: 'custom', name: '', category: 'custom' },
        preparation: null,
        isStructured: true
      },
      isNew: true
    };

    setTempNewIngredient(newIngredient);
    setNewIngredientEditing(true);
  };

  const handleNewIngredientSave = async (ingredient, newText) => {
    // Process the new ingredient just like editing an existing one
    try {
      const structured = await import('../services/ingredientServiceInstance.js')
        .then(module => module.default.parseIngredientText(newText.trim()));
      
      // Extract the ingredient name from the edited text to preserve user input
      const textParts = newText.trim().split(/\s+/);
      let userIngredientName = '';
      
      let startIndex = 0;
      if (textParts[0] && /^\d/.test(textParts[0])) {
        startIndex = 1;
      }
      if (textParts[startIndex] && structured.unit && 
          (textParts[startIndex].toLowerCase() === structured.unit.name?.toLowerCase() ||
           textParts[startIndex].toLowerCase() === structured.unit.plural?.toLowerCase())) {
        startIndex++;
      }
      
      const remainingText = textParts.slice(startIndex).join(' ');
      const commaIndex = remainingText.indexOf(',');
      userIngredientName = commaIndex > -1 
        ? remainingText.substring(0, commaIndex).trim()
        : remainingText.trim();
      
      if (userIngredientName) {
        structured.ingredient = {
          id: 'custom',
          name: userIngredientName,
          category: 'custom'
        };
      }
      
      const finalIngredient = {
        id: `ingredient_${Date.now()}`,
        originalText: newText.trim(),
        structured: structured,
        displayText: structured.isStructured 
          ? await import('../services/ingredientServiceInstance.js')
              .then(module => module.default.formatIngredientForDisplay(structured))
          : newText.trim()
      };

      // Add to ingredients list
      setIngredients(prev => [...prev, finalIngredient]);

      // Track ingredient addition
      if (tracking.isInitialized) {
        await tracking.trackIngredientAdded(finalIngredient, {
          recipeId: editedRecipe.id,
          recipeName: editedRecipe.title,
          method: 'manual_add'
        });
      }
    } catch (error) {
      console.warn('Error parsing new ingredient:', error);
    }

    // Clear the temporary state
    setNewIngredientEditing(false);
    setTempNewIngredient(null);
  };

  const handleNewIngredientCancel = () => {
    // User cancelled, don't add anything
    setNewIngredientEditing(false);
    setTempNewIngredient(null);
  };

  const removeIngredientFromSteps = (deletedIngredient) => {
    const ingredientName = getIngredientName(deletedIngredient);
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.ingredients && step.ingredients.length > 0) {
          const filteredIngredients = step.ingredients.filter(stepIngredient => 
            !isIngredientMatch(stepIngredient, ingredientName)
          );
          
          return {
            ...step,
            ingredients: filteredIngredients
          };
        }
        return step;
      })
    }));
  };

  /**
   * Convert action verbs to present tense for step instructions
   */
  const convertToPresentTense = (action) => {
    if (!action) return '';
    
    // Common cooking verb conversions
    const verbMap = {
      // Past tense to present tense
      'chopped': 'chop',
      'diced': 'dice',
      'sliced': 'slice',
      'minced': 'mince',
      'grated': 'grate',
      'shredded': 'shred',
      'peeled': 'peel',
      'crushed': 'crush',
      'julienned': 'julienne',
      'cubed': 'cube',
      'halved': 'halve',
      'quartered': 'quarter',
      'trimmed': 'trim',
      'cored': 'core',
      'pitted': 'pit',
      'seeded': 'seed',
      'sifted': 'sift',
      'drained': 'drain',
      'rinsed': 'rinse',
      'dried': 'dry',
      'juiced': 'juice',
      'cooked': 'cook',
      'roasted': 'roast',
      'grilled': 'grill',
      'steamed': 'steam',
      'boiled': 'boil',
      'fried': 'fry',
      'sautéed': 'sauté',
      'baked': 'bake',
      'broiled': 'broil',
      'melted': 'melt',
      'heated': 'heat',
      'mixed': 'mix',
      'stirred': 'stir',
      'beaten': 'beat',
      'whisked': 'whisk',
      'folded': 'fold',
      'combined': 'combine',
      
      // Gerund (-ing) to present tense
      'chopping': 'chop',
      'dicing': 'dice',
      'slicing': 'slice',
      'mincing': 'mince',
      'grating': 'grate',
      'shredding': 'shred',
      'peeling': 'peel',
      'crushing': 'crush',
      'mixing': 'mix',
      'stirring': 'stir',
      'cooking': 'cook',
      'heating': 'heat',
      'beating': 'beat',
      'whisking': 'whisk',
      'folding': 'fold',
      'combining': 'combine'
    };
    
    // Split action into words and convert each verb
    const words = action.toLowerCase().split(/\s+/);
    const convertedWords = words.map(word => {
      // Remove common punctuation
      const cleanWord = word.replace(/[,.]$/, '');
      const punctuation = word.match(/[,.]$/) ? word.slice(-1) : '';
      
      // Check if word is in our verb map
      if (verbMap[cleanWord]) {
        return verbMap[cleanWord] + punctuation;
      }
      
      // Handle regular past tense (-ed ending)
      if (cleanWord.endsWith('ed') && cleanWord.length > 3) {
        let base = cleanWord.slice(0, -2);
        // Handle doubled consonants (e.g., 'chopped' -> 'chop')
        if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
          base = base.slice(0, -1);
        }
        return base + punctuation;
      }
      
      // Return original word if no conversion needed
      return word;
    });
    
    return convertedWords.join(' ');
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{editedRecipe.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              {editedRecipe.steps.length} steps
            </Text>
            {calculateTotalTime() > 0 && (
              <Text style={styles.metaText}>
                ~{calculateTotalTime()} minutes
              </Text>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.ingredientsContainer}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <Text style={styles.sectionSubtitle}>
                  Manage your recipe ingredients
                </Text>
                
                {ingredients.map((ingredient) => (
                  <StructuredIngredient
                    key={ingredient.id}
                    ingredient={ingredient}
                    onEdit={handleIngredientEdit}
                    onDelete={handleIngredientDelete}
                    onCreateStep={handleCreateStepFromAction}
                    showActions={true}
                  />
                ))}
                
                {newIngredientEditing && tempNewIngredient && (
                  <StructuredIngredient
                    key={tempNewIngredient.id}
                    ingredient={tempNewIngredient}
                    onEdit={handleNewIngredientSave}
                    onDelete={(ingredient) => {
                      // For new ingredients, just cancel without adding
                      handleNewIngredientCancel();
                    }}
                    onCreateStep={() => {}}
                    showActions={true}
                    forceEditMode={true}
                  />
                )}
                
                {!newIngredientEditing && (
                  <TouchableOpacity
                    style={styles.addIngredientButton}
                    onPress={handleAddIngredient}
                  >
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                    <Text style={styles.addIngredientText}>Add Ingredient</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.stepsContainer}>
                <Text style={styles.sectionTitle}>Recipe Steps</Text>
                <Text style={styles.sectionSubtitle}>
                  Review and customize your recipe flow. Drag to reorder steps.
                </Text>
                
                {editedRecipe.steps.map((step, index) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    index={index}
                    ingredients={ingredients}
                    onUpdate={handleStepUpdate}
                    onDelete={handleDeleteStep}
                    onAddAfter={handleAddStep}
                    onReorder={handleStepReorder}
                    isFirst={index === 0}
                    isLast={index === editedRecipe.steps.length - 1}
                  />
                ))}
              </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={isSaving ? "Saving..." : "Save Recipe"}
            onPress={handleSave}
            disabled={isSaving || editedRecipe.steps.length === 0}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 0,
    marginBottom: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 20,
  },
  ingredientsContainer: {
    marginBottom: 30,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'left',
  },
  ingredientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 8,
  },
  button: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  addIngredientText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
});