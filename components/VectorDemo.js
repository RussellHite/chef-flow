/**
 * VectorDemo Component
 * 
 * Demo component for testing vector similarity search
 * Used for Phase 1 validation and performance testing
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import ingredientService from '../services/ingredientServiceInstance';

export default function VectorDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [similarIngredients, setSimilarIngredients] = useState([]);
  const [smartSearchResults, setSmartSearchResults] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [vectorEnabled, setVectorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if vector features are enabled
    const analytics = ingredientService.getPerformanceAnalytics();
    setVectorEnabled(analytics.vectorEnabled);
  }, []);

  const handleSimilaritySearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const startTime = Date.now();
      const results = await ingredientService.findSimilarIngredients(searchQuery, 0.3, 10);
      const duration = Date.now() - startTime;
      
      setSimilarIngredients(results);
      setPerformance(prev => ({
        ...prev,
        similaritySearch: duration
      }));
    } catch (error) {
      console.error('Similarity search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const startTime = Date.now();
      const results = await ingredientService.smartSearchIngredients(searchQuery, 10);
      const duration = Date.now() - startTime;
      
      setSmartSearchResults(results);
      setPerformance(prev => ({
        ...prev,
        smartSearch: duration
      }));
    } catch (error) {
      console.error('Smart search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVectorFeatures = () => {
    const newState = !vectorEnabled;
    ingredientService.setVectorFeaturesEnabled(newState);
    setVectorEnabled(newState);
  };

  const getPerformanceAnalytics = () => {
    const analytics = ingredientService.getPerformanceAnalytics();
    setPerformance(analytics);
  };

  const renderIngredientResult = (ingredient, index) => {
    const name = ingredient.name || ingredient.structured?.ingredient?.name || ingredient.displayText || 'Unknown';
    const score = ingredient.similarityScore || ingredient.confidence || 0;
    const matchType = ingredient.matchType || 'unknown';
    
    return (
      <View key={index} style={styles.resultItem}>
        <Text style={styles.ingredientName}>{name}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.score}>Score: {score.toFixed(3)}</Text>
          <Text style={[styles.matchType, matchType === 'vector' && styles.vectorMatch]}>
            {matchType}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vector Search Demo</Text>
      
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Vector Features:</Text>
        <TouchableOpacity onPress={toggleVectorFeatures} style={styles.toggleButton}>
          <Text style={[styles.toggleText, vectorEnabled && styles.enabledText]}>
            {vectorEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Enter ingredient name (try typos like 'tomatoe')"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={colors.textSecondary}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleSimilaritySearch}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Find Similar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleSmartSearch}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Smart Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={getPerformanceAnalytics}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Performance Metrics */}
      {performance && (
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Performance</Text>
          {performance.similaritySearch && (
            <Text style={styles.metric}>Similarity Search: {performance.similaritySearch}ms</Text>
          )}
          {performance.smartSearch && (
            <Text style={styles.metric}>Smart Search: {performance.smartSearch}ms</Text>
          )}
          {performance.operations && Object.keys(performance.operations).length > 0 && (
            <View style={styles.analyticsContainer}>
              <Text style={styles.analyticsTitle}>Operation Analytics:</Text>
              {Object.entries(performance.operations).map(([op, stats]) => (
                <Text key={op} style={styles.analyticsItem}>
                  {op}: {stats.count} ops, avg {stats.avgDuration.toFixed(1)}ms
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Similarity Search Results */}
      {similarIngredients.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Similar Ingredients</Text>
          {similarIngredients.map(renderIngredientResult)}
        </View>
      )}

      {/* Smart Search Results */}
      {smartSearchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Smart Search Results</Text>
          {smartSearchResults.map(renderIngredientResult)}
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  
  statusLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  toggleText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  
  enabledText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  searchInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  
  secondaryButtonText: {
    color: colors.text,
  },
  
  performanceContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  
  metric: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  
  analyticsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  analyticsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  analyticsItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  resultsContainer: {
    marginBottom: 20,
  },
  
  resultItem: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  ingredientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  score: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  matchType: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  vectorMatch: {
    color: colors.primary,
  },
  
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});