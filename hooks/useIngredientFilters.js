/**
 * useIngredientFilters Hook
 * 
 * Manages ingredient filtering and search functionality
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

export const useIngredientFilters = (ingredients = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  /**
   * Filter ingredients based on search query and category
   */
  const filteredIngredients = useMemo(() => {
    let filtered = ingredients;

    // Filter by category first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.category === selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(query) ||
        (ingredient.searchTerms && ingredient.searchTerms.some(term => 
          term.toLowerCase().includes(query)
        ))
      );
    }

    return filtered;
  }, [ingredients, selectedCategory, searchQuery]);

  /**
   * Clear search query
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  /**
   * Toggle filters panel expansion
   */
  const toggleFiltersExpanded = useCallback(() => {
    setFiltersExpanded(prev => !prev);
  }, []);

  /**
   * Set category filter
   */
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  /**
   * Set search query
   */
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Get filter statistics
   */
  const getFilterStats = useCallback(() => {
    const totalIngredients = ingredients.length;
    const filteredCount = filteredIngredients.length;
    const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all';

    return {
      total: totalIngredients,
      filtered: filteredCount,
      hasActiveFilters,
      isSearchActive: searchQuery.trim() !== '',
      isCategoryActive: selectedCategory !== 'all'
    };
  }, [ingredients.length, filteredIngredients.length, searchQuery, selectedCategory]);

  /**
   * Get search suggestions based on current query
   */
  const getSearchSuggestions = useCallback(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const suggestions = new Set();

    ingredients.forEach(ingredient => {
      // Add ingredient name if it matches
      if (ingredient.name.toLowerCase().includes(query)) {
        suggestions.add(ingredient.name);
      }

      // Add matching search terms
      if (ingredient.searchTerms) {
        ingredient.searchTerms.forEach(term => {
          if (term.toLowerCase().includes(query)) {
            suggestions.add(term);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  }, [ingredients, searchQuery]);

  /**
   * Check if a specific ingredient matches current filters
   */
  const doesIngredientMatchFilters = useCallback((ingredient) => {
    // Check category filter
    if (selectedCategory !== 'all' && ingredient.category !== selectedCategory) {
      return false;
    }

    // Check search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = ingredient.name.toLowerCase().includes(query);
      const matchesSearchTerms = ingredient.searchTerms && 
        ingredient.searchTerms.some(term => term.toLowerCase().includes(query));
      
      return matchesName || matchesSearchTerms;
    }

    return true;
  }, [selectedCategory, searchQuery]);

  return {
    // State
    searchQuery,
    selectedCategory,
    filtersExpanded,
    filteredIngredients,
    
    // Actions
    setSearchQuery: handleSearchChange,
    setSelectedCategory: handleCategoryChange,
    clearSearch,
    clearAllFilters,
    toggleFiltersExpanded,
    
    // Computed values
    getFilterStats,
    getSearchSuggestions,
    doesIngredientMatchFilters
  };
};