import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function AddRecipeScreen({ navigation }) {
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeContent, setRecipeContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isFormValid = recipeTitle.trim().length > 0 && recipeContent.trim().length > 0;

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    
    try {
      // TODO: Implement recipe parsing logic
      const parsedRecipe = await parseRecipe(recipeTitle, recipeContent);
      
      // Navigate to recipe editing screen with parsed data
      navigation.navigate('EditRecipe', { 
        recipe: parsedRecipe,
        isNew: true 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (recipeTitle.trim() || recipeContent.trim()) {
      Alert.alert(
        'Discard Recipe?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Import and use the intelligent recipe parser
  const parseRecipe = async (title, content) => {
    // Use intelligent parsing engine
    const { parseRecipe: intelligentParse } = await import('../utils/recipeParser');
    return intelligentParse(title, content);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Recipe</Text>
            <Text style={styles.subtitle}>
              Paste your recipe in any format - we'll convert it into a step-by-step cooking flow
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Recipe Title</Text>
              <TextInput
                style={styles.titleInput}
                value={recipeTitle}
                onChangeText={setRecipeTitle}
                placeholder="Enter recipe name..."
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Recipe Content</Text>
              <Text style={styles.helpText}>
                Paste your recipe here - ingredients, steps, or any format
              </Text>
              <TextInput
                style={styles.contentInput}
                value={recipeContent}
                onChangeText={setRecipeContent}
                placeholder="Paste your recipe here..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>
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
            title={isProcessing ? "Processing..." : "Next"}
            onPress={handleNext}
            disabled={!isFormValid || isProcessing}
            style={[styles.button, !isFormValid && styles.disabledButton]}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  titleInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    ...commonStyles.shadow,
  },
  contentInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    height: 200,
    ...commonStyles.shadow,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});