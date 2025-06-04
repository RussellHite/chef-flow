import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function StepEditor({ 
  step, 
  index, 
  onUpdate, 
  onDelete, 
  onAddAfter, 
  onReorder,
  isFirst,
  isLast 
}) {
  const [isEditing, setIsEditing] = useState(!step.content);
  const [content, setContent] = useState(step.content);
  const [timing, setTiming] = useState(step.timing || '');

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Step content cannot be empty');
      return;
    }

    onUpdate(step.id, {
      ...step,
      content: content.trim(),
      timing: timing.trim() || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(step.content);
    setTiming(step.timing || '');
    setIsEditing(false);
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return null;
    
    return ingredients.map((ingredient, index) => (
      <Text key={index} style={styles.ingredient}>
        • {ingredient}
      </Text>
    ));
  };

  const getStepTypeIcon = () => {
    const content = step.content.toLowerCase();
    if (content.includes('prep') || content.includes('chop') || content.includes('slice')) {
      return 'restaurant';
    }
    if (content.includes('heat') || content.includes('cook') || content.includes('bake')) {
      return 'flame';
    }
    if (content.includes('mix') || content.includes('stir') || content.includes('combine')) {
      return 'refresh';
    }
    return 'ellipse';
  };

  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    // Split by periods, exclamation marks, or question marks, but keep the punctuation
    const sentences = text.split(/([.!?]+)/)
      .reduce((acc, part, index, array) => {
        if (index % 2 === 0) {
          // This is the sentence content
          const punctuation = array[index + 1] || '';
          const sentence = (part + punctuation).trim();
          if (sentence.length > 0) {
            acc.push(sentence);
          }
        }
        return acc;
      }, []);
    
    // If no sentences were found (no punctuation), return the original text
    return sentences.length > 0 ? sentences : [text];
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.stepInfo}>
            <Ionicons 
              name={getStepTypeIcon()} 
              size={16} 
              color={colors.primary} 
              style={styles.stepIcon}
            />
            {step.timing && (
              <Text style={styles.timing}>{step.timing}</Text>
            )}
          </View>
          
          <View style={styles.actions}>
            {!isEditing && (
              <>
                <TouchableOpacity 
                  onPress={() => setIsEditing(true)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => onAddAfter(index)}
                  style={styles.actionButton}
                >
                  <Ionicons name="add" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => onDelete(step.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={16} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Enter step instructions..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            
            <TextInput
              style={styles.timingInput}
              value={timing}
              onChangeText={setTiming}
              placeholder="Timing (e.g., 5 minutes)"
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.editActions}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={[styles.editButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSave}
                style={[styles.editButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContent}>
            <View style={styles.sentencesContainer}>
              {splitIntoSentences(step.content).map((sentence, index) => (
                <Text key={index} style={styles.stepText}>
                  {sentence}
                </Text>
              ))}
            </View>
            
            {step.ingredients && step.ingredients.length > 0 && (
              <View style={styles.ingredientsContainer}>
                {formatIngredients(step.ingredients)}
              </View>
            )}
          </View>
        )}

        {!isEditing && (
          <View style={styles.reorderControls}>
            {!isFirst && (
              <TouchableOpacity 
                onPress={() => onReorder(index, index - 1)}
                style={styles.reorderButton}
              >
                <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            
            {!isLast && (
              <TouchableOpacity 
                onPress={() => onReorder(index, index + 1)}
                style={styles.reorderButton}
              >
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 8,
  },
  timing: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  displayContent: {
    marginBottom: 8,
  },
  sentencesContainer: {
    gap: 6,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  ingredientsContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  ingredient: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  editForm: {
    marginBottom: 8,
  },
  contentInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 60,
    marginBottom: 8,
  },
  timingInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  reorderControls: {
    flexDirection: 'row',
    gap: 4,
  },
  reorderButton: {
    padding: 4,
  },
});