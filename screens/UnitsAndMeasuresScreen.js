import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { UNITS } from '../data/ingredientDatabase.js';

export default function UnitsAndMeasuresScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Convert UNITS object to array and add some metadata
    const unitsArray = Object.values(UNITS).map(unit => ({
      ...unit,
      isNew: ['jar', 'bottle', 'bag', 'pint', 'quart', 'gallon', 'dozen', 'bunch', 'head', 'stalk', 'rib', 'strip', 'slice', 'dash', 'drop', 'splash'].includes(unit.id)
    }));
    setUnits(unitsArray);
  }, []);

  const unitTypes = [
    { key: 'all', label: 'All Units', count: units.length },
    { key: 'volume', label: 'Volume', count: units.filter(u => u.type === 'volume').length },
    { key: 'weight', label: 'Weight', count: units.filter(u => u.type === 'weight').length },
    { key: 'count', label: 'Count', count: units.filter(u => u.type === 'count').length },
    { key: 'size', label: 'Size', count: units.filter(u => u.type === 'size').length },
    { key: 'container', label: 'Container', count: units.filter(u => u.type === 'container').length }
  ];

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.plural.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || unit.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderHeader = () => {
    const getSubtitleText = () => {
      const hasActiveFilters = searchQuery.length > 0 || selectedType !== 'all';
      if (hasActiveFilters) {
        return `${filteredUnits.length} of ${units.length} units`;
      }
      return `${units.length} units`;
    };

    return (
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Units & Measures</Text>
          <Text style={styles.subtitle}>{getSubtitleText()}</Text>
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    const renderTypeFilters = () => (
      <View style={styles.typeFilter}>
        <View style={styles.typeFilterContent}>
          {unitTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                selectedType === type.key && styles.selectedTypeChip
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Text style={[
                styles.typeChipText,
                selectedType === type.key && styles.selectedTypeChipText
              ]}>
                {type.label}
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
                placeholder="Search units..."
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
            
            {/* Type Filter */}
            {renderTypeFilters()}
          </View>
        )}
      </View>
    );
  };

  const renderUnitItem = ({ item: unit }) => (
    <View style={styles.unitCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameSection}>
          <Text style={styles.unitName}>{unit.name}</Text>
          <Text style={styles.pluralText}>({unit.plural})</Text>
        </View>
        <View style={styles.badgeSection}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{unit.type}</Text>
          </View>
          {unit.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>ID</Text>
          <Text style={styles.detailValue}>{unit.id}</Text>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{unit.type}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.container}>
        {renderHeader()}
        
        {renderFilters()}
        
        <FlatList
          data={filteredUnits}
          renderItem={renderUnitItem}
          keyExtractor={(item) => item.id}
          style={styles.unitsList}
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
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
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
  
  // Type Filter
  typeFilter: {
    marginBottom: 0,
  },
  typeFilterContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedTypeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  selectedTypeChipText: {
    color: colors.surface,
  },
  
  // Unit List
  unitsList: {
    flex: 1,
  },
  
  // Unit Card
  unitCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitName: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pluralText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  badgeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 11,
  },
  newBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  newBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 24,
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