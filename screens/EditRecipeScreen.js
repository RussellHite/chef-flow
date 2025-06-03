import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import StepEditor from '../components/StepEditor';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe, isNew } = route.params;
  const [editedRecipe, setEditedRecipe] = useState(recipe);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isNew ? 'Review Recipe' : 'Edit Recipe',
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isNew]);

  const handleStepUpdate = (stepId, updatedStep) => {
    setEditedRecipe(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? updatedStep : step
      ),
    }));
  };

  const handleStepReorder = (fromIndex, toIndex) => {
    const newSteps = [...editedRecipe.steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const handleAddStep = (afterIndex) => {
    const newStep = {
      id: `step_${Date.now()}`,
      content: '',
      timing: null,
      ingredients: [],
    };

    const newSteps = [...editedRecipe.steps];
    newSteps.splice(afterIndex + 1, 0, newStep);
    
    setEditedRecipe(prev => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const handleDeleteStep = (stepId) => {
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEditedRecipe(prev => ({
              ...prev,
              steps: prev.steps.filter(step => step.id !== stepId),
            }));
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement recipe saving logic
      await saveRecipe(editedRecipe, isNew);
      
      if (isNew) {
        navigation.navigate('Recipes', { 
          newRecipe: editedRecipe,
          showSuccess: true 
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to go back?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  // Temporary save function - will be enhanced with persistent storage
  const saveRecipe = async (recipe, isNew) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Recipe saved:', recipe.title);
  };

  const calculateTotalTime = () => {
    return editedRecipe.steps.reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{editedRecipe.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              {editedRecipe.steps.length} steps
            </Text>
            {calculateTotalTime() > 0 && (
              <Text style={styles.metaText}>
                ~{calculateTotalTime()} minutes
              </Text>
            )}
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Recipe Steps</Text>
          <Text style={styles.sectionSubtitle}>
            Review and customize your recipe flow. Drag to reorder steps.
          </Text>
          
          {editedRecipe.steps.map((step, index) => (
            <StepEditor
              key={step.id}
              step={step}
              index={index}
              onUpdate={handleStepUpdate}
              onDelete={handleDeleteStep}
              onAddAfter={handleAddStep}
              onReorder={handleStepReorder}
              isFirst={index === 0}
              isLast={index === editedRecipe.steps.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title={isSaving ? "Saving..." : "Save Recipe"}
          onPress={handleSave}
          disabled={isSaving || editedRecipe.steps.length === 0}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
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
  stepsContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
});