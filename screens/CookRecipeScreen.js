import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import StructuredIngredient from '../components/StructuredIngredient';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function CookRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [readyByTime, setReadyByTime] = useState('');

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
    navigation.navigate('CookingFlow', { recipe });
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

        <View style={styles.buttonContainer}>
          <Button
            title="Let's Cook!"
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
});