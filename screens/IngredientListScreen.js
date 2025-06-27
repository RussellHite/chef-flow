import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import ingredientService from '../services/ingredientServiceInstance';

export default function IngredientListScreen({ navigation }) {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [searchQuery, selectedCategory, ingredients]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all ingredients and categories
      const [allIngredients, allCategories] = await Promise.all([
        ingredientService.searchIngredients('', 1000), // Get all ingredients
        ingredientService.getCategories(),
      ]);
      
      setIngredients(allIngredients);
      setCategories([{ id: 'all', name: 'All Categories' }, ...allCategories]);
    } catch (error) {
      console.error('Error loading ingredient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let filtered = ingredients;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.searchTerms.some(term => term.toLowerCase().includes(query))
      );
    }

    setFilteredIngredients(filtered);
  };

  const renderIngredientCard = ({ item: ingredient }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {categories.find(cat => cat.id === ingredient.category)?.name || ingredient.category}
          </Text>
        </View>
      </View>
      
      <Text style={styles.pluralText}>{ingredient.plural}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Common Units</Text>
          <Text style={styles.detailValue}>
            {ingredient.commonUnits.join(', ')}
          </Text>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Preparations</Text>
          <Text style={styles.detailValue}>
            {ingredient.commonPreparations.join(', ')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <View style={styles.categoryFilterContent}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFiltersAccordion = () => (
    <View style={styles.filtersAccordion}>
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={() => setFiltersExpanded(!filtersExpanded)}
      >
        <Text style={styles.accordionTitle}>Filters</Text>
        <Ionicons 
          name={filtersExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {filtersExpanded && (
        <View style={styles.accordionContent}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Category Filter */}
          {renderCategoryFilter()}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={[commonStyles.container, commonStyles.centerContent]}>
          <Text>Loading ingredients...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ingredient Database</Text>
          <Text style={styles.subtitle}>
            {filteredIngredients.length} of {ingredients.length} ingredients
          </Text>
        </View>

        {/* Filters Accordion */}
        {renderFiltersAccordion()}

        {/* Ingredient Cards */}
        <FlatList
          data={filteredIngredients}
          renderItem={renderIngredientCard}
          keyExtractor={item => item.id}
          style={styles.ingredientList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    paddingBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Filters Accordion
  filtersAccordion: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accordionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  accordionContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 2,
  },
  
  // Category Filter
  categoryFilter: {
    marginBottom: 0,
  },
  categoryFilterContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: colors.surface,
  },
  
  // Ingredient Cards
  ingredientList: {
    flex: 1,
  },
  ingredientCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 11,
  },
  pluralText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 8,
  },
  detailSection: {
    gap: 2,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
  },
});