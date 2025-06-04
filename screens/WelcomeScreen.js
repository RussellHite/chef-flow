import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useRecipes } from '../contexts/RecipeContext';

export default function WelcomeScreen({ navigation, route }) {
  const { recipes, addRecipe } = useRecipes();

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
  }, [route.params, addRecipe, navigation]);

  const handleAddRecipe = () => {
    navigation.navigate('Recipes', {
      screen: 'AddRecipe'
    });
  };

  const handleEditRecipe = (recipe) => {
    navigation.navigate('Recipes', {
      screen: 'EditRecipe',
      params: { 
        recipe, 
        originalContent: recipe.originalContent,
        isNew: false,
        fromHome: true
      }
    });
  };

  const renderRecipeCard = ({ item: recipe }) => (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Button
        title="Edit"
        onPress={() => handleEditRecipe(recipe)}
        variant="secondary"
        style={styles.editButton}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant" size={80} color={colors.primary} />
      </View>
      
      <Text style={styles.title}>Welcome to Chef Flow</Text>
      <Text style={styles.subtitle}>Your culinary companion</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Add New Recipe"
          onPress={handleAddRecipe}
          style={styles.addButton}
        />
      </View>
    </View>
  );

  const renderWithRecipes = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Welcome to Chef Flow</Text>
        <Text style={styles.welcomeSubtitle}>Your culinary companion</Text>
      </View>
      
      <View style={styles.recipesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recipes</Text>
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
      </View>
    </View>
  );

  return (
    <View style={[commonStyles.container]}>
      {recipes.length === 0 ? renderEmptyState() : renderWithRecipes()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 50,
    ...commonStyles.shadow,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  
  // With recipes styles
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  recipesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h2,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  recipeTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  editButton: {
    minWidth: 80,
  },
});