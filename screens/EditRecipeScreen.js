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
  const { updateRecipe } = useRecipes();
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
    });
  }, [navigation, isNew, fromHome]);

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


  const handleIngredientEdit = (ingredient) => {
    Alert.prompt(
      'Edit Ingredient',
      'Enter the full ingredient specification (e.g., "2 cups flour"):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newText) => {
            if (newText && newText.trim()) {
              try {
                // Re-parse the ingredient text
                const structured = await import('../services/ingredientServiceInstance.js')
                  .then(module => module.default.parseIngredientText(newText.trim()));
                
                const updatedIngredient = {
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
                // Fallback to simple text update
                const updatedIngredient = {
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
          }
        }
      ],
      'plain-text',
      ingredient.originalText || ingredient.displayText
    );
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
          },
        },
      ]
    );
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