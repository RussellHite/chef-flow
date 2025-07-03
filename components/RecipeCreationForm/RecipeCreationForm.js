/**
 * RecipeCreationForm Component
 * 
 * Main form container for recipe creation
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { RecipeFormHeader } from './RecipeFormHeader';
import { RecipeFormField } from './RecipeFormField';
import { RecipeFormActions } from './RecipeFormActions';
import { colors } from '../../styles/colors';

export const RecipeCreationForm = ({
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
  isProcessing,
  isValid
}) => {
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <RecipeFormHeader />
      
      <View style={styles.form}>
        <RecipeFormField
          label="Recipe Title"
          value={formData.title}
          onChangeText={onFieldChange('title')}
          placeholder="Enter recipe name..."
          maxLength={100}
          autoCapitalize="words"
          returnKeyType="next"
        />
        
        <RecipeFormField
          label="Ingredients"
          value={formData.ingredients}
          onChangeText={onFieldChange('ingredients')}
          placeholder="2 cups flour&#10;1 tsp salt&#10;3 eggs&#10;1 cup milk"
          multiline
          helpText="List your ingredients with quantities, one per line"
          autoCapitalize="none"
        />
        
        <RecipeFormField
          label="Steps"
          value={formData.steps}
          onChangeText={onFieldChange('steps')}
          placeholder="1. Preheat oven to 350°F&#10;2. Mix dry ingredients&#10;3. Add wet ingredients&#10;4. Bake for 30 minutes"
          multiline
          helpText="Enter your cooking steps in order, one per line"
          autoCapitalize="sentences"
        />
      </View>
      
      <RecipeFormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        isProcessing={isProcessing}
        isValid={isValid}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});