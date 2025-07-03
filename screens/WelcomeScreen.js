import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { useRecipes } from '../contexts/RecipeContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation, route }) {
  const { recipes, addRecipe } = useRecipes();
  const [isOnline, setIsOnline] = useState(true);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const insets = useSafeAreaInsets();

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

  const handleCookRecipe = (recipe) => {
    navigation.navigate('Recipes', {
      screen: 'CookRecipe',
      params: { recipe }
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerContent}>
        {/* App Logo & Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="restaurant" size={20} color={colors.primary} />
          </View>
          <View style={styles.brandingText}>
            <Text style={styles.appTitle}>Chef Flow</Text>
            <Text style={styles.appSubtitle}>Recipe workflow management</Text>
          </View>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusIndicators}>
          {currentRecipe && (
            <View style={styles.activeRecipeIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeRecipeText}>{currentRecipe.name}</Text>
            </View>
          )}
          
          <View style={styles.connectionStatus}>
            <Ionicons 
              name={isOnline ? "wifi" : "wifi-outline"} 
              size={16} 
              color={isOnline ? colors.success : colors.warning} 
            />
            <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
              <Text style={[styles.statusBadgeText, isOnline ? styles.onlineBadgeText : styles.offlineBadgeText]}>
                {isOnline ? 'Synced' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <View style={styles.quickActionCard}>
        <View style={styles.quickActionIcon}>
          <Ionicons name="add" size={24} color={colors.surface} />
        </View>
        <Text style={styles.quickActionTitle}>Add New Recipe</Text>
        <Text style={styles.quickActionDescription}>
          Paste or type your recipe and let our parser structure it for you
        </Text>
        <Button
          title="Start Parsing"
          onPress={handleAddRecipe}
          style={styles.quickActionButton}
        />
      </View>
    </View>
  );

  const renderRecipeCard = ({ item: recipe }) => {
    const needsReview = Math.random() > 0.7; // Simulate some recipes needing review
    const lastCooked = ['2 days ago', '1 week ago', '3 days ago', 'Never'][Math.floor(Math.random() * 4)];
    
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => handleEditRecipe(recipe)}
      >
        {/* Recipe Image Placeholder */}
        <View style={styles.recipeImageContainer}>
          <View style={styles.recipeImagePlaceholder}>
            <Ionicons name="image" size={24} color={colors.textSecondary} />
          </View>
        </View>
        
        {/* Recipe Content */}
        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
            {needsReview && (
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>Needs Review</Text>
              </View>
            )}
          </View>
          
          <View style={styles.recipeInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={12} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {recipe.totalTime || '25 minutes'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={12} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {recipe.servings || '4'} servings
              </Text>
            </View>
          </View>
          
          <View style={styles.recipeFooter}>
            <Text style={styles.lastCookedText}>Last cooked: {lastCooked}</Text>
            {!needsReview && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  handleCookRecipe(recipe);
                }}
                style={styles.cookButton}
              >
                <Text style={styles.cookButtonText}>Cook</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      
      <View style={styles.mainContent}>
        {renderQuickActions()}
        
        <View style={styles.emptyStateContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="restaurant" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No recipes yet</Text>
          <Text style={styles.emptyStateDescription}>
            Start by adding your first recipe and experience the power of structured cooking workflows
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderWithRecipes = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      
      <View style={styles.mainContent}>
        {renderQuickActions()}
        
        <View style={styles.recipesSection}>
          <View style={styles.recipeSectionHeader}>
            <Text style={styles.recipeSectionTitle}>
              <Ionicons name="restaurant" size={20} color={colors.primary} /> Recent Recipes
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Recipes')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipeGrid}>
            {recipes.map((recipe) => (
              <View key={recipe.id}>
                {renderRecipeCard({ item: recipe })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={[commonStyles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {recipes.length === 0 ? renderEmptyState() : renderWithRecipes()}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandingText: {
    flex: 1,
  },
  appTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  appSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeRecipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  activeRecipeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineBadge: {
    backgroundColor: `${colors.success}1A`,
  },
  offlineBadge: {
    backgroundColor: `${colors.warning}1A`,
  },
  statusBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  onlineBadgeText: {
    color: colors.success,
  },
  offlineBadgeText: {
    color: colors.warning,
  },
  
  // Main content
  mainContent: {
    paddingBottom: 100,
  },
  
  // Quick Actions styles
  quickActionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  quickActionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  quickActionButton: {
    width: '100%',
  },
  
  // Empty state styles
  emptyStateContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...commonStyles.shadow,
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Recipes section styles
  recipesSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  recipeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recipeSectionTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    borderRadius: 6,
  },
  viewAllButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  recipeGrid: {
    gap: 16,
  },
  
  // Recipe card styles
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...commonStyles.shadow,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  recipeImageContainer: {
    width: 96,
    height: 96,
  },
  recipeImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeContent: {
    flex: 1,
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recipeTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  reviewBadge: {
    backgroundColor: `${colors.warning}1A`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.warning}33`,
  },
  reviewBadgeText: {
    ...typography.caption,
    color: colors.warning,
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 12,
  },
  recipeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastCookedText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  cookButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: 'transparent',
  },
  cookButtonText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
});