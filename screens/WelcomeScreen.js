import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function WelcomeScreen({ navigation }) {
  const handleAddRecipe = () => {
    navigation.navigate('Recipes');
  };

  return (
    <View style={[commonStyles.container, commonStyles.centerContent]}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant" size={80} color={colors.primary} />
      </View>
      
      <Text style={styles.title}>Welcome to Chef Flow</Text>
      <Text style={styles.subtitle}>Your culinary companion</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Add Recipe"
          onPress={handleAddRecipe}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 50,
    ...commonStyles.shadow,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addButton: {
    width: '80%',
    maxWidth: 300,
  },
});