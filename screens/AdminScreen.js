import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function AdminScreen({ navigation }) {
  const adminPages = [
    {
      id: 'ingredient-list',
      title: 'Ingredient List',
      description: 'View and manage all ingredients in the database',
      icon: 'list',
      onPress: () => navigation.navigate('IngredientList'),
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage ingredient categories',
      icon: 'grid',
      onPress: () => {
        // TODO: Navigate to categories page
        console.log('Categories page coming soon');
      },
    },
    {
      id: 'units',
      title: 'Units & Measurements',
      description: 'View and edit measurement units',
      icon: 'scale',
      onPress: () => {
        // TODO: Navigate to units page
        console.log('Units page coming soon');
      },
    },
    {
      id: 'prep-methods',
      title: 'Preparation Methods',
      description: 'Manage ingredient preparation methods',
      icon: 'cut',
      onPress: () => {
        // TODO: Navigate to prep methods page
        console.log('Prep methods page coming soon');
      },
    },
    {
      id: 'parsing-training',
      title: 'Parsing Training',
      description: 'View and manage ingredient parsing training data',
      icon: 'school',
      onPress: () => navigation.navigate('ParsingTraining'),
    },
    {
      id: 'vector-demo',
      title: 'Vector Search Demo',
      description: 'Test vector similarity search and performance metrics',
      icon: 'search',
      onPress: () => navigation.navigate('VectorDemo'),
    },
    {
      id: 'ingredient-tracking-demo',
      title: 'Ingredient Learning Demo',
      description: 'Test ingredient data collection for ML training',
      icon: 'library',
      onPress: () => navigation.navigate('IngredientTrackingDemo'),
    },
    {
      id: 'data-dashboard',
      title: 'Data Analytics Dashboard',
      description: 'View insights and visualizations of your cooking data',
      icon: 'bar-chart',
      onPress: () => navigation.navigate('DataDashboard'),
    },
    {
      id: 'privacy-controls',
      title: 'Privacy & Data Controls',
      description: 'Manage data collection consent and privacy settings',
      icon: 'shield-checkmark',
      onPress: () => navigation.navigate('PrivacyControls'),
    },
  ];

  const renderAdminCard = (page) => (
    <TouchableOpacity
      key={page.id}
      style={styles.adminCard}
      onPress={page.onPress}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={page.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{page.title}</Text>
        <Text style={styles.cardDescription}>{page.description}</Text>
      </View>
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>
            Manage app data and configurations
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Database Management</Text>
          {adminPages.map(renderAdminCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },
  adminCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardArrow: {
    marginLeft: 8,
  },
});