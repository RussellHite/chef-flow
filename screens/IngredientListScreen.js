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

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
      <Text style={[styles.headerCell, styles.categoryColumn]}>Category</Text>
      <Text style={[styles.headerCell, styles.unitsColumn]}>Common Units</Text>
      <Text style={[styles.headerCell, styles.prepColumn]}>Preparations</Text>
    </View>
  );

  const renderIngredientRow = ({ item: ingredient, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <View style={[styles.cell, styles.nameColumn]}>
        <Text style={styles.cellText}>{ingredient.name}</Text>
        <Text style={styles.cellSubtext}>{ingredient.plural}</Text>
      </View>
      
      <View style={[styles.cell, styles.categoryColumn]}>
        <Text style={styles.cellText}>
          {categories.find(cat => cat.id === ingredient.category)?.name || ingredient.category}
        </Text>
      </View>
      
      <View style={[styles.cell, styles.unitsColumn]}>
        <Text style={styles.cellText}>
          {ingredient.commonUnits.slice(0, 3).join(', ')}
          {ingredient.commonUnits.length > 3 ? '...' : ''}
        </Text>
      </View>
      
      <View style={[styles.cell, styles.prepColumn]}>
        <Text style={styles.cellText}>
          {ingredient.commonPreparations.slice(0, 2).join(', ')}
          {ingredient.commonPreparations.length > 2 ? '...' : ''}
        </Text>
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
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
        </View>

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Data Table */}
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          
          <FlatList
            data={filteredIngredients}
            renderItem={renderIngredientRow}
            keyExtractor={item => item.id}
            style={styles.tableContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  
  // Search
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 4,
  },
  
  // Category Filter
  categoryFilter: {
    marginBottom: 16,
  },
  categoryFilterContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  
  // Table
  tableContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableContent: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  evenRow: {
    backgroundColor: colors.surface,
  },
  oddRow: {
    backgroundColor: colors.background,
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  cellSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  
  // Column widths
  nameColumn: {
    flex: 2,
  },
  categoryColumn: {
    flex: 1.5,
  },
  unitsColumn: {
    flex: 2,
  },
  prepColumn: {
    flex: 2,
  },
});