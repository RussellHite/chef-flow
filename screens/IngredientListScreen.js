import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { useIngredientList } from '../hooks/useIngredientList';
import { useIngredientFilters } from '../hooks/useIngredientFilters';
import {
  IngredientCard,
  IngredientFilters,
  IngredientEditModal,
  IngredientListHeader
} from '../components/IngredientList';
import { transformIngredientForEdit, transformFormToIngredient } from '../utils/ingredientManagementUtils';

export default function IngredientListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // Use custom hooks for data management
  const { ingredients, categories, loading, updateIngredient, getCategoryById } = useIngredientList();
  const {
    searchQuery,
    selectedCategory,
    filtersExpanded,
    filteredIngredients,
    setSearchQuery,
    setSelectedCategory,
    toggleFiltersExpanded,
    getFilterStats
  } = useIngredientFilters(ingredients);
  
  // Local state for editing
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Get filter statistics
  const filterStats = getFilterStats();

  const handleEditIngredient = (ingredient) => {
    console.log('Edit button pressed for ingredient:', ingredient);
    setEditingIngredient(ingredient);
    const formData = transformIngredientForEdit(ingredient);
    console.log('Setting editForm to:', formData);
    setEditForm(formData);
  };

  const handleSaveEdit = async () => {
    try {
      console.log('Saving ingredient:', editForm);
      
      const updatedIngredientData = transformFormToIngredient(editForm, editingIngredient);
      await updateIngredient(editingIngredient.id, updatedIngredientData);
      
      setEditingIngredient(null);
      setEditForm({});
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
    setEditForm({});
  };

  const renderIngredientCard = ({ item: ingredient }) => (
    <IngredientCard
      ingredient={ingredient}
      category={getCategoryById(ingredient.category)}
      onEdit={handleEditIngredient}
    />
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <IngredientListHeader
          totalIngredients={ingredients.length}
          filteredCount={filteredIngredients.length}
          hasActiveFilters={filterStats.hasActiveFilters}
          topPadding={insets.top + 20}
        />

        {/* Filters */}
        <IngredientFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          filtersExpanded={filtersExpanded}
          onToggleFilters={toggleFiltersExpanded}
        />

        {/* Ingredient List */}
        <FlatList
          data={filteredIngredients}
          renderItem={renderIngredientCard}
          keyExtractor={item => item.id}
          style={styles.ingredientList}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* Edit Modal */}
      <IngredientEditModal
        ingredient={editingIngredient}
        editForm={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        visible={!!editingIngredient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ingredientList: {
    flex: 1,
  },
});