/**
 * Ingredient Tracking Demo Component
 * 
 * Demonstrates the ingredient learning data collection system
 * Shows how to integrate tracking into React components
 * Provides testing interface for data collection features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

// For demo purposes, we'll create a simple mock implementation
// In production, you would import from the actual hook
const useMockIngredientTracking = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Simulate initialization
    setTimeout(() => {
      setIsInitialized(true);
      setSessionId(`demo_session_${Date.now()}`);
      setAnalytics({
        sessionId: `demo_session_${Date.now()}`,
        duration: 0,
        metrics: {
          interactionCount: 0,
          ingredientsViewed: 0,
          ingredientsSelected: 0,
          searchCount: 0,
          correctionCount: 0,
          feedbackCount: 0
        },
        eventCount: 0,
        quality: 'good'
      });
    }, 1000);
  }, []);

  const trackSearch = async (query, results, context) => {
    console.log('🔍 Tracked Search:', { query, results: results.length, context });
    return true;
  };

  const trackSelection = async (ingredient, context) => {
    console.log('✅ Tracked Selection:', { ingredient: ingredient.name, context });
    return true;
  };

  const trackCorrection = async (original, corrected, type) => {
    console.log('✏️ Tracked Correction:', { original: original.name, corrected: corrected.name, type });
    return true;
  };

  const trackCombination = async (ingredients, context) => {
    console.log('🥘 Tracked Combination:', { ingredients: ingredients.map(i => i.name), context });
    return true;
  };

  const trackFeedback = async (ingredient, feedbackType, rating, context) => {
    console.log('👍 Tracked Feedback:', { ingredient: ingredient.name, feedbackType, rating, context });
    return true;
  };

  const exportData = async (options) => {
    const mockData = {
      metadata: {
        exportDate: Date.now(),
        version: '1.0.0',
        format: 'json'
      },
      events: [
        {
          id: 'event_1',
          sessionId: sessionId,
          timestamp: Date.now(),
          eventType: 'ingredient_search',
          data: {
            query: 'tomato',
            resultCount: 5,
            hasResults: true
          }
        },
        {
          id: 'event_2',
          sessionId: sessionId,
          timestamp: Date.now(),
          eventType: 'ingredient_select',
          data: {
            ingredientName: 'Roma Tomato',
            category: 'vegetables'
          }
        }
      ]
    };
    
    console.log('📤 Exported Data:', mockData);
    return JSON.stringify(mockData, null, 2);
  };

  return {
    isInitialized,
    sessionId,
    analytics,
    trackSearch,
    trackSelection,
    trackCorrection,
    trackCombination,
    trackFeedback,
    exportData,
    CONTEXT_TYPES: {
      RECIPE_CREATION: 'recipe_creation',
      COOKING_SESSION: 'cooking_session',
      MEAL_PLANNING: 'meal_planning'
    },
    FEEDBACK_TYPES: {
      LIKE: 'like',
      DISLIKE: 'dislike',
      LOVE: 'love',
      HATE: 'hate'
    }
  };
};

export default function IngredientTrackingDemo() {
  const {
    isInitialized,
    sessionId,
    analytics,
    trackSearch,
    trackSelection,
    trackCorrection,
    trackCombination,
    trackFeedback,
    exportData,
    CONTEXT_TYPES,
    FEEDBACK_TYPES
  } = useMockIngredientTracking();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Sample ingredients for demo
  const sampleIngredients = [
    { id: '1', name: 'Roma Tomato', category: 'vegetables' },
    { id: '2', name: 'Yellow Onion', category: 'vegetables' },
    { id: '3', name: 'Garlic', category: 'aromatics' },
    { id: '4', name: 'Olive Oil', category: 'oils' },
    { id: '5', name: 'Basil', category: 'herbs' },
    { id: '6', name: 'Mozzarella', category: 'dairy' },
    { id: '7', name: 'Chicken Breast', category: 'protein' },
    { id: '8', name: 'Pasta', category: 'grains' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const results = sampleIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    await trackSearch(searchQuery, results, {
      contextType: CONTEXT_TYPES.RECIPE_CREATION,
      searchStartTime: Date.now()
    });

    Alert.alert(
      'Search Tracked!',
      `Query: "${searchQuery}"\nResults: ${results.length} ingredients found`,
      [{ text: 'OK' }]
    );
  };

  const handleIngredientSelect = async (ingredient) => {
    if (selectedIngredients.find(i => i.id === ingredient.id)) {
      // Remove ingredient
      setSelectedIngredients(prev => prev.filter(i => i.id !== ingredient.id));
    } else {
      // Add ingredient
      setSelectedIngredients(prev => [...prev, ingredient]);
      
      await trackSelection(ingredient, {
        contextType: CONTEXT_TYPES.RECIPE_CREATION,
        selectionOrder: selectedIngredients.length + 1,
        totalIngredients: selectedIngredients.length + 1
      });
    }
  };

  const handleCorrection = async () => {
    const original = { name: 'Tomatoe', text: 'Tomatoe' }; // Typo
    const corrected = { name: 'Tomato', text: 'Tomato' }; // Corrected

    await trackCorrection(original, corrected, 'name');
    
    Alert.alert(
      'Correction Tracked!',
      'Original: "Tomatoe" → Corrected: "Tomato"',
      [{ text: 'OK' }]
    );
  };

  const handleCombination = async () => {
    if (selectedIngredients.length < 2) {
      Alert.alert(
        'Need More Ingredients',
        'Select at least 2 ingredients to track a combination',
        [{ text: 'OK' }]
      );
      return;
    }

    await trackCombination(selectedIngredients, {
      contextType: CONTEXT_TYPES.RECIPE_CREATION,
      cuisineType: 'Italian',
      mealType: 'dinner'
    });

    Alert.alert(
      'Combination Tracked!',
      `${selectedIngredients.length} ingredients combined for Italian dinner`,
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = async (ingredient, feedbackType) => {
    await trackFeedback(ingredient, feedbackType, null, {
      contextType: CONTEXT_TYPES.RECIPE_CREATION,
      isExplicit: true
    });

    Alert.alert(
      'Feedback Tracked!',
      `${ingredient.name}: ${feedbackType}`,
      [{ text: 'OK' }]
    );
  };

  const handleExportData = async () => {
    const exportedData = await exportData({
      includeEvents: true,
      format: 'json'
    });

    Alert.alert(
      'Data Exported!',
      'Check console for exported data',
      [{ text: 'OK' }]
    );
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ingredient Tracking Demo</Text>
        <Text style={styles.subtitle}>Initializing data collection...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ingredient Learning Data Collection</Text>
      <Text style={styles.subtitle}>Demo & Testing Interface</Text>

      {/* Session Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Current Session</Text>
        <Text style={styles.infoText}>Session ID: {sessionId}</Text>
        <Text style={styles.infoText}>Status: Active</Text>
        <Text style={styles.infoText}>Context: Recipe Creation</Text>
      </View>

      {/* Search Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Search Tracking</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Search for ingredients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Track Search</Text>
        </TouchableOpacity>
      </View>

      {/* Ingredient Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Selection Tracking</Text>
        <Text style={styles.subtitle}>Tap ingredients to select/deselect:</Text>
        <View style={styles.ingredientGrid}>
          {sampleIngredients.map(ingredient => {
            const isSelected = selectedIngredients.find(i => i.id === ingredient.id);
            return (
              <TouchableOpacity
                key={ingredient.id}
                style={[styles.ingredientItem, isSelected && styles.selectedItem]}
                onPress={() => handleIngredientSelect(ingredient)}
              >
                <Text style={[styles.ingredientText, isSelected && styles.selectedText]}>
                  {ingredient.name}
                </Text>
                <Text style={styles.categoryText}>{ingredient.category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.infoText}>
          Selected: {selectedIngredients.length} ingredients
        </Text>
      </View>

      {/* Correction Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ Correction Tracking</Text>
        <TouchableOpacity style={styles.button} onPress={handleCorrection}>
          <Text style={styles.buttonText}>Track Typo Correction</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Tracks: "Tomatoe" → "Tomato"</Text>
      </View>

      {/* Combination Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥘 Combination Tracking</Text>
        <TouchableOpacity 
          style={[styles.button, selectedIngredients.length < 2 && styles.disabledButton]} 
          onPress={handleCombination}
          disabled={selectedIngredients.length < 2}
        >
          <Text style={styles.buttonText}>Track Ingredient Combination</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Need {Math.max(0, 2 - selectedIngredients.length)} more ingredients
        </Text>
      </View>

      {/* Feedback Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👍 Feedback Tracking</Text>
        {selectedIngredients.length > 0 && (
          <View>
            <Text style={styles.subtitle}>Rate: {selectedIngredients[0].name}</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity 
                style={[styles.feedbackButton, styles.loveButton]}
                onPress={() => handleFeedback(selectedIngredients[0], FEEDBACK_TYPES.LOVE)}
              >
                <Text style={styles.feedbackText}>❤️ Love</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.feedbackButton, styles.likeButton]}
                onPress={() => handleFeedback(selectedIngredients[0], FEEDBACK_TYPES.LIKE)}
              >
                <Text style={styles.feedbackText}>👍 Like</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.feedbackButton, styles.dislikeButton]}
                onPress={() => handleFeedback(selectedIngredients[0], FEEDBACK_TYPES.DISLIKE)}
              >
                <Text style={styles.feedbackText}>👎 Dislike</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {selectedIngredients.length === 0 && (
          <Text style={styles.subtitle}>Select an ingredient to rate it</Text>
        )}
      </View>

      {/* Data Export */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 Data Export</Text>
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>Export Collected Data</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Exports JSON data to console</Text>
      </View>

      {/* Analytics */}
      {analytics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Session Analytics</Text>
          <Text style={styles.infoText}>Duration: {Math.round(analytics.duration / 1000)}s</Text>
          <Text style={styles.infoText}>Interactions: {analytics.metrics.interactionCount}</Text>
          <Text style={styles.infoText}>Searches: {analytics.metrics.searchCount}</Text>
          <Text style={styles.infoText}>Selections: {analytics.metrics.ingredientsSelected}</Text>
          <Text style={styles.infoText}>Quality: {analytics.quality}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎯 This demo shows how ingredient interactions are captured for ML training
        </Text>
        <Text style={styles.footerText}>
          📊 All data is stored locally and can be synced when online
        </Text>
        <Text style={styles.footerText}>
          🔒 Privacy controls allow users to manage their data
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
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
    marginBottom: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.background,
    ...typography.body,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  ingredientItem: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ingredientText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.surface,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  feedbackButton: {
    borderRadius: 8,
    padding: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  loveButton: {
    backgroundColor: '#FF6B9D',
  },
  likeButton: {
    backgroundColor: '#4ECDC4',
  },
  dislikeButton: {
    backgroundColor: '#FF6B6B',
  },
  feedbackText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.primaryLight || colors.border,
    borderRadius: 8,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});