import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { RecipeCreationForm } from '../components/RecipeCreationForm';
import { useRecipeCreation } from '../hooks/useRecipeCreation';
import { colors } from '../styles/colors';

export default function AddRecipeScreen({ navigation }) {
  // Initialize recipe creation hook
  const recipeCreation = useRecipeCreation(navigation);

  useEffect(() => {
    navigation.setOptions({
      title: 'Add New Recipe',
    });
  }, [navigation]);


  return (
    <View style={styles.container}>
      <RecipeCreationForm
        formData={{
          title: recipeCreation.recipeTitle,
          ingredients: recipeCreation.ingredients,
          steps: recipeCreation.steps
        }}
        onFieldChange={(field) => (value) => recipeCreation.updateField(field, value)}
        onSubmit={recipeCreation.processRecipe}
        onCancel={recipeCreation.handleCancel}
        isProcessing={recipeCreation.isProcessing}
        isValid={recipeCreation.isFormValid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});