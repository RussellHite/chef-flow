import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { parseRecipe } from '../utils/recipeParser';
import { useRecipeCreationTracking } from '../hooks/useIngredientTracking';

export default function AddRecipeScreen({ navigation }) {
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize ingredient tracking for recipe creation
  const tracking = useRecipeCreationTracking();

  useEffect(() => {
    navigation.setOptions({
      title: 'Add New Recipe',
    });
  }, [navigation]);


  const isFormValid = recipeTitle.trim().length > 0 && ingredients.trim().length > 0 && steps.trim().length > 0;

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    
    try {
      // Parse recipe with separate ingredients and steps
      const parsedRecipe = await parseRecipe(recipeTitle, steps, ingredients);
      
      // Track recipe creation with parsed ingredients
      if (tracking.isInitialized && parsedRecipe.ingredients) {
        await tracking.trackRecipeCompleted(parsedRecipe.ingredients, {
          name: recipeTitle,
          id: parsedRecipe.id || `recipe_${Date.now()}`,
          totalIngredients: parsedRecipe.ingredients.length,
          isComplete: false, // Recipe creation started, not completed
          source: 'recipe_creation'
        });
      }
      
      // Navigate to recipe editing screen with parsed data and original content
      navigation.navigate('EditRecipe', { 
        recipe: parsedRecipe,
        originalContent: {
          ingredients: ingredients,
          steps: steps
        },
        isNew: true 
      });
    } catch (error) {
      console.error('Recipe parsing error:', error);
      Alert.alert('Error', 'Failed to process recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (recipeTitle.trim() || ingredients.trim() || steps.trim()) {
      Alert.alert(
        'Discard Recipe?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };


  return (
    <View style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Enter your recipe ingredients and steps - we'll convert it into a step-by-step cooking flow
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Recipe Title</Text>
              <TextInput
                style={styles.titleInput}
                value={recipeTitle}
                onChangeText={setRecipeTitle}
                placeholder="Enter recipe name..."
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Ingredients</Text>
              <Text style={styles.helpText}>
                List your ingredients with quantities (e.g., "2 cups flour, 1 tsp salt")
              </Text>
              <TextInput
                style={styles.contentInput}
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="2 cups flour&#10;1 tsp salt&#10;1 cup sugar..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Steps</Text>
              <Text style={styles.helpText}>
                Enter your cooking steps in order
              </Text>
              <TextInput
                style={styles.contentInput}
                value={steps}
                onChangeText={setSteps}
                placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients&#10;3. Add wet ingredients..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
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
              title={isProcessing ? "Processing..." : "Next"}
              onPress={handleNext}
              disabled={!isFormValid || isProcessing}
              style={[styles.button, !isFormValid && styles.disabledButton]}
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  titleInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    ...commonStyles.shadow,
  },
  contentInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    height: 200,
    ...commonStyles.shadow,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 8,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});