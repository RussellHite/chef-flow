import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useRecipes } from '../contexts/RecipeContext';

export default function RecipesScreen({ navigation, route }) {
  const { recipes, addRecipe } = useRecipes();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle new recipe from EditRecipe screen
    if (route.params?.newRecipe) {
      addRecipe(route.params.newRecipe);
      
      if (route.params?.showSuccess) {
        Alert.alert('Success', 'Recipe saved successfully!');
      }
      
      // Clear the params
      navigation.setParams({ newRecipe: null, showSuccess: false });
    }
  }, [route.params]);

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('CookRecipe', { recipe });
  };

  const handleEditRecipe = (recipe) => {
    navigation.navigate('EditRecipe', { 
      recipe, 
      originalContent: recipe.originalContent,
      isNew: false 
    });
  };

  const renderRecipeCard = ({ item: recipe }) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
      </View>
      
      <View style={styles.recipeInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            {recipe.totalTime || 'No timing'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="list" size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            {recipe.steps?.length || 0} steps
          </Text>
        </View>
        
        {recipe.servings && (
          <View style={styles.infoItem}>
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {recipe.servings}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.recipeActions}>
        <TouchableOpacity 
          onPress={() => handleEditRecipe(recipe)}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Edit Recipe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleRecipePress(recipe)}
          style={[styles.actionButton, styles.primaryActionButton]}
        >
          <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>Cook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Recipes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first recipe to get started with Chef Flow
      </Text>
      <Button
        title="Add Your First Recipe"
        onPress={handleAddRecipe}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={styles.container}>
        {recipes.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Recipes</Text>
              <TouchableOpacity 
                onPress={handleAddRecipe}
                style={styles.addButton}
              >
                <Ionicons name="add" size={24} color={colors.surface} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item.id}
              style={styles.recipeList}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  recipeList: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryActionButtonText: {
    color: colors.surface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    minWidth: 200,
  },
});