import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
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
import { extractAmount, extractName, getIngredientName, getIngredientDisplayText } from '../utils/ingredientUtils';
import { calculateParsingProgress, getRecognizedIngredientsCount, getNeedsReviewCount, generateId } from '../utils/recipeUtils';
import { convertToPresentTense, capitalizeFirst } from '../utils/textUtils';
import { RecipeContentSyncService } from '../services/RecipeContentSyncService';
import { IngredientParser } from '../services/IngredientParser';
import { useRecipeEditor } from '../hooks/useRecipeEditor';
import { useIngredientManager } from '../hooks/useIngredientManager';
import { useStepManager } from '../hooks/useStepManager';
import { RecipeEditorHeader, IngredientsSection, StepsSection } from '../components/RecipeEditor';

const { width } = Dimensions.get('window');

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe, originalContent, isNew, fromHome } = route.params;
  const { updateRecipe, deleteRecipe } = useRecipes();
  
  // Initialize hooks for state management
  const recipeEditor = useRecipeEditor(recipe, isNew, {
    onSave: updateRecipe,
    onDelete: deleteRecipe,
    navigation
  });
  
  const ingredientManager = useIngredientManager(recipe.ingredients || []);
  
  const stepManager = useStepManager(recipe.steps || [], {
    onStepsChange: recipeEditor.updateSteps
  });
  
  // Local state variables
  const [isSaving, setIsSaving] = useState(false);
  const [originalStepContent, setOriginalStepContent] = useState(new Map());
  
  // Initialize ingredient tracking for recipe editing
  const tracking = useRecipeCreationTracking();
  
  // Calculate ingredient status using utilities
  const stats = ingredientManager.getStats();
  const recognizedCount = stats.recognized;
  const needsReviewCount = stats.needsReview;
  const parsingProgress = stats.progress;

  useEffect(() => {
    navigation.setOptions({
      title: isNew ? 'Review Recipe' : 'Edit Recipe',
      headerShown: false, // We'll render our own header
    });
    
    // Store original step content on first load
    if (recipeEditor.recipe.steps && originalStepContent.size === 0) {
      const originalContent = new Map();
      recipeEditor.recipe.steps.forEach(step => {
        originalContent.set(step.id, step.content);
      });
      setOriginalStepContent(originalContent);
    }
  }, [navigation, isNew, fromHome, recipeEditor.recipe.steps, originalStepContent.size]);

  // Sync ingredients with main recipe and apply tracking if needed
  useEffect(() => {
    // Check if recipe needs ingredient tracking migration
    const needsTracking = recipeEditor.recipe.steps && 
                         recipeEditor.recipe.steps.length > 0 && 
                         recipeEditor.recipe.steps.some(step => 
                           step.ingredients && 
                           step.ingredients.length > 0 && 
                           typeof step.ingredients[0] === 'string'
                         );
    
    if (needsTracking && ingredientManager.ingredients.length > 0) {
      try {
        // Apply ingredient tracking to existing recipe
        const { steps: trackedSteps, ingredientTracker } = updateIngredientTracking(recipeEditor.recipe.steps, ingredientManager.ingredients);
        
        // Also update step content with amounts
        const stepsWithUpdatedContent = trackedSteps.map((step, stepIndex) => {
          let updatedContent = step.content;
          
          if (step.ingredients && Array.isArray(step.ingredients)) {
            step.ingredients.forEach(ingredientRef => {
              if (ingredientRef && typeof ingredientRef === 'object' && 
                  ingredientRef.isFirstMention && ingredientRef.id) {
                
                const ingredient = ingredientManager.ingredients.find(ing => ing.id === ingredientRef.id);
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
        
        ingredientManager.setAllIngredients(ingredientManager.ingredients);
        stepManager.setAllSteps(stepsWithUpdatedContent);
      } catch (error) {
        console.warn('Error applying ingredient tracking:', error);
        // Fallback to simple update
        ingredientManager.setAllIngredients(ingredientManager.ingredients);
      }
    } else {
      ingredientManager.setAllIngredients(ingredientManager.ingredients);
    }
  }, [ingredientManager.ingredients]);

  const handleStepUpdate = (stepId, updatedStep) => {
    stepManager.updateStep(stepId, updatedStep);
  };

  const handleStepReorder = (fromIndex, toIndex) => {
    stepManager.reorderSteps(fromIndex, toIndex);
  };

  const handleAddStep = (afterIndex) => {
    stepManager.addStep('', afterIndex + 1);
  };

  const handleCreateStepFromAction = (stepContent, ingredientId) => {
    stepManager.addStepFromAction(stepContent, ingredientId, 0);
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
            stepManager.deleteStep(stepId);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update recipe with current ingredient and step data
      recipeEditor.updateRecipe({
        ingredients: ingredientManager.ingredients,
        steps: stepManager.steps
      });
      
      const success = await recipeEditor.saveRecipe();
      if (success) {
        // Track recipe completion
        if (tracking.isInitialized && ingredientManager.ingredients.length > 0) {
          await tracking.trackRecipeCompleted(ingredientManager.ingredients, {
            name: recipeEditor.title,
            id: recipeEditor.recipe.id || `recipe_${Date.now()}`,
            totalIngredients: ingredientManager.ingredients.length,
            totalSteps: stepManager.steps?.length || 0,
            isComplete: true,
            source: isNew ? 'recipe_creation' : 'recipe_edit'
          });
        }
        
        if (isNew) {
          navigation.navigate('Home', { 
            newRecipe: { ...recipeEditor.recipe, originalContent },
            showSuccess: true 
          });
        } else {
          // Update existing recipe in context
          updateRecipe({ ...recipeEditor.recipe, originalContent });
          navigation.goBack();
        }
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
      `Are you sure you want to delete "${recipeEditor.recipe.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Recipe',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipeEditor.recipe.id);
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
    return recipeEditor.recipe.steps.reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);
  };


  const handleIngredientEdit = async (ingredient, newText) => {
    try {
      const updatedIngredient = await ingredientManager.editIngredient(ingredient, newText);
      
      // Update recipe with new ingredients and sync steps
      recipeEditor.updateIngredients(ingredientManager.ingredients);
      stepManager.syncWithIngredients(ingredientManager.ingredients);
    } catch (error) {
      console.error('Error editing ingredient:', error);
      Alert.alert('Error', 'Failed to update ingredient. Please try again.');
    }
  };

  const handleIngredientEditOld = async (ingredient, newText) => {
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
          
          ingredientManager.setAllIngredients(
            ingredientManager.ingredients.map(ing => 
              ing.id === ingredient.id ? updatedIngredient : ing
            )
          );
        } catch (error) {
          console.warn('Error parsing structured ingredient:', error);
          // Fallback to updating just the text
          updatedIngredient = {
            ...ingredient,
            originalText: newText.trim(),
            displayText: newText.trim()
          };
          
          ingredientManager.setAllIngredients(
            ingredientManager.ingredients.map(ing => 
              ing.id === ingredient.id ? updatedIngredient : ing
            )
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
          
          ingredientManager.setAllIngredients(
            ingredientManager.ingredients.map(ing => 
              ing.id === ingredient.id ? updatedIngredient : ing
            )
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
          
          ingredientManager.setAllIngredients(
            ingredientManager.ingredients.map(ing => 
              ing.id === ingredient.id ? updatedIngredient : ing
            )
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
    const currentSteps = stepManager.steps;
    if (!currentSteps || !ingredientManager.ingredients) return;
    
    try {
      const updatedSteps = RecipeContentSyncService.updateAllStepsContent(
        currentSteps,
        ingredientManager.ingredients,
        originalStepContent,
        updatedIngredient
      );
      stepManager.setAllSteps(updatedSteps);
    } catch (error) {
      console.error('Error updating steps content:', error);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you would like to add a photo:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Camera feature coming soon') },
        { text: 'Choose from Library', onPress: () => console.log('Photo library feature coming soon') },
      ]
    );
  };

  const handleEditImage = () => {
    Alert.alert(
      'Edit Recipe Image',
      'Choose how you want to add or change the recipe image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Take photo feature coming soon') },
        { text: 'Choose from Library', onPress: () => console.log('Photo library feature coming soon') },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          onPress={handleCancel}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <TextInput
            value={recipeEditor.title}
            onChangeText={recipeEditor.setTitle}
            style={styles.titleInput}
            placeholder="Recipe name"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${parsingProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{parsingProgress}% parsed</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleEditImage}
          style={styles.editImageButton}
        >
          <Ionicons name="camera" size={20} color={colors.primary} />
          <View style={styles.incompleteBadge}>
            <Text style={styles.incompleteBadgeText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.backgroundImage}>
        <View style={styles.backgroundPattern} />
      </View>
      
      <RecipeEditorHeader
        title={recipeEditor.title}
        onTitleChange={recipeEditor.setTitle}
        servings={recipeEditor.servings}
        parsingProgress={parsingProgress}
        isSaving={isSaving}
        onCancel={handleCancel}
        onSave={handleSave}
        onTestRecipe={() => {
          const completeRecipe = {
            ...recipeEditor.recipe,
            title: recipeEditor.title,
            servings: recipeEditor.servings,
            ingredients: ingredientManager.ingredients,
            steps: stepManager.steps
          };
          navigation.navigate('CookRecipe', { recipe: completeRecipe });
        }}
        editedRecipe={{
          ...recipeEditor.recipe,
          title: recipeEditor.title,
          servings: recipeEditor.servings,
          ingredients: ingredientManager.ingredients,
          steps: stepManager.steps
        }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <IngredientsSection
          ingredients={ingredientManager.ingredients}
          onEditIngredient={ingredientManager.editIngredient}
          onDeleteIngredient={ingredientManager.deleteIngredient}
          onAddIngredient={ingredientManager.addIngredient}
        />

        <StepsSection
          steps={stepManager.steps}
          onStepUpdate={handleStepUpdate}
          onStepReorder={handleStepReorder}
          onDeleteStep={handleDeleteStep}
          onAddStep={handleAddStep}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${colors.primary}05`,
  },
  backgroundPattern: {
    flex: 1,
    backgroundColor: 'transparent',
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

