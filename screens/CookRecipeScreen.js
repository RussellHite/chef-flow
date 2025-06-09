import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import StructuredIngredient from '../components/StructuredIngredient';
import { useCookingSessionSimple } from '../hooks/useCookingSessionSimple';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function CookRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [readyByTime, setReadyByTime] = useState('');
  
  // Get cooking session state
  const { isActive, recipeName, error } = useCookingSessionSimple();
  
  // Log any errors for debugging
  if (error) {
    console.error('CookRecipeScreen - Cooking session error:', error);
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Cook Recipe',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    calculateReadyByTime();
  }, [recipe]);

  const calculateReadyByTime = () => {
    // Calculate total time from steps
    const totalMinutes = recipe.steps.reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);

    // Add current time to total cooking time
    const now = new Date();
    const readyTime = new Date(now.getTime() + totalMinutes * 60000);
    
    // Format time (e.g., "6:30 PM")
    const timeString = readyTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    setReadyByTime(timeString);
  };

  const handleLetsCook = () => {
    // Simplified for debugging - just navigate to cooking flow
    if (isActive && recipeName !== recipe.title) {
      Alert.alert(
        'Active Cooking Session',
        `You're currently cooking "${recipeName}". Starting a new recipe will end the current session.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start New Recipe', 
            onPress: () => navigation.navigate('CookingFlow', { recipe })
          }
        ]
      );
    } else {
      navigation.navigate('CookingFlow', { recipe });
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.readyByContainer}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={styles.readyByLabel}>Ready by:</Text>
              <Text style={styles.readyByTime}>{readyByTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ingredientsContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.sectionSubtitle}>
            Collect your ingredients to cook
          </Text>
          
          {recipe.ingredients && recipe.ingredients.map((ingredient) => (
            <StructuredIngredient
              key={ingredient.id}
              ingredient={ingredient}
              showActions={false}
              compact={false}
            />
          ))}
        </View>

        {isActive && (
          <View style={styles.activeSessionBanner}>
            <View style={styles.activeSessionHeader}>
              <Ionicons name="flame" size={20} color={colors.primary} />
              <Text style={styles.activeSessionTitle}>Active Cooking Session</Text>
            </View>
            <Text style={styles.activeSessionText}>
              You're currently cooking: {recipeName}
            </Text>
            <TouchableOpacity 
              style={styles.resumeButton}
              onPress={() => navigation.navigate('CookingFlow', { recipe: { title: recipeName } })}
            >
              <Text style={styles.resumeButtonText}>Resume Cooking</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={isActive && recipeName === recipe.title ? "Continue Cooking" : "Let's Cook!"}
            onPress={handleLetsCook}
            style={styles.cookButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 0,
    marginBottom: 15,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readyByLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  readyByTime: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  ingredientsContainer: {
    marginBottom: 30,
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 30,
  },
  cookButton: {
    width: '100%',
    paddingVertical: 16,
  },
  headerButton: {
    padding: 8,
  },
  activeSessionBanner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activeSessionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  activeSessionText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  resumeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  resumeButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
});