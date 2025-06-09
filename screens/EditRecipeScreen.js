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
  const [activeTab, setActiveTab] = useState('flow');

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
  }, [navigation, isNew, fromHome]);

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

    setEditedRecipe(prev => ({
      ...prev,
      steps: [newStep, ...prev.steps],
    }));
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
    try {
      let updatedIngredient;
      
      // Check if this is already a structured ingredient object (from manual training)
      if (typeof ingredient === 'object' && ingredient.structured && newText) {
        // This is a pre-structured ingredient from manual training
        updatedIngredient = ingredient;
        setIngredients(prev => 
          prev.map(ing => ing.id === ingredient.id ? ingredient : ing)
        );
      } else if (newText && newText.trim()) {
        // Original parsing logic for text-based edits
        try {
          // Re-parse the ingredient text
          const structured = await import('../services/ingredientServiceInstance.js')
            .then(module => module.default.parseIngredientText(newText.trim()));
          
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

      // Only update step content for existing steps, don't interfere with step creation
      if (updatedIngredient) {
        try {
          updateStepsWithIngredient(ingredient, updatedIngredient);
        } catch (stepError) {
          console.warn('Error updating steps with ingredient:', stepError);
        }
      }
    } catch (error) {
      console.error('Error in handleIngredientEdit:', error);
      Alert.alert('Error', 'Failed to update ingredient. Please try again.');
    }
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
              const regex = new RegExp(`\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
              
              // Check if step content already contains the specific amount + unit + ingredient combination
              const simpleSpecTrimmed = simpleSpec.trim();
              const alreadyHasThisAmount = updatedContent.includes(simpleSpecTrimmed);
              
              // Also check for any amount pattern before this ingredient name
              const beforeIngredientPattern = new RegExp(`\\d+\\s*[a-zA-Z]*\\s*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
              const hasAnyAmountForThisIngredient = beforeIngredientPattern.test(updatedContent);
              
              if (isFirstMention && !alreadyHasThisAmount && !hasAnyAmountForThisIngredient) {
                // First mention: show full amount + unit + name (only if not already present)
                updatedContent = updatedContent.replace(regex, simpleSpecTrimmed);
              } else if (!isFirstMention) {
                // Subsequent mentions: show just ingredient name
                const justName = updatedIngredient.structured?.ingredient?.name || originalName;
                // Only replace if we're not replacing an amount specification
                if (!hasAnyAmountForThisIngredient) {
                  updatedContent = updatedContent.replace(regex, justName);
                }
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
          onPress: () => {
            setIngredients(prev => prev.filter(ing => ing.id !== ingredient.id));
            
            // Remove ingredient from steps
            removeIngredientFromSteps(ingredient);
          },
        },
      ]
    );
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

        <View style={styles.tabContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'flow' && styles.activeTabButton]}
              onPress={() => setActiveTab('flow')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'flow' && styles.activeTabButtonText]}>
                Flow
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'oldguard' && styles.activeTabButton]}
              onPress={() => setActiveTab('oldguard')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'oldguard' && styles.activeTabButtonText]}>
                Old Guard
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'flow' ? (
            <>
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
            </>
          ) : (
            <View style={styles.oldGuardContainer}>
              <Text style={styles.sectionTitle}>Original Recipe</Text>
              <Text style={styles.sectionSubtitle}>
                Recipe as originally entered - unprocessed format
              </Text>
              
              {originalContent ? (
                <>
                  <View style={styles.oldGuardSection}>
                    <Text style={styles.oldGuardSectionTitle}>Ingredients</Text>
                    <View style={styles.oldGuardContent}>
                      <Text style={styles.oldGuardOriginalText}>
                        {originalContent.ingredients || 'No ingredients provided'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.oldGuardSection}>
                    <Text style={styles.oldGuardSectionTitle}>Steps</Text>
                    <View style={styles.oldGuardContent}>
                      <Text style={styles.oldGuardOriginalText}>
                        {originalContent.steps || 'No steps provided'}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.oldGuardContent}>
                  <Text style={styles.oldGuardItem}>
                    Original content not available for this recipe.
                  </Text>
                </View>
              )}
            </View>
          )}
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
  tabContainer: {
    marginBottom: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.surface,
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
  oldGuardContainer: {
    marginBottom: 20,
  },
  oldGuardSection: {
    marginBottom: 24,
  },
  oldGuardSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  oldGuardContent: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  oldGuardItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  oldGuardStep: {
    ...typography.body,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  oldGuardOriginalText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    whiteSpace: 'pre-line',
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
});