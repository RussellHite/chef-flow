/**
 * IngredientFilters Component
 * 
 * Accordion-style filters for search and category filtering
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const IngredientFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  filtersExpanded,
  onToggleFilters
}) => {
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
            onPress={() => onCategoryChange(category.id)}
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

  return (
    <View style={styles.filtersAccordion}>
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={onToggleFilters}
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
              onChangeText={onSearchChange}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
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
};

const styles = StyleSheet.create({
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
});