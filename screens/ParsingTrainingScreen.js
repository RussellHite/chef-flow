import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import TrainingDataService from '../services/TrainingDataService';

export default function ParsingTrainingScreen({ navigation }) {
  const [trainingData, setTrainingData] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0 });

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      const data = await TrainingDataService.loadTrainingData();
      setTrainingData([...data].reverse()); // Most recent first
      
      const stats = TrainingDataService.getStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  const clearAllTrainingData = () => {
    Alert.alert(
      'Clear Training Data',
      'Are you sure you want to delete all training data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await TrainingDataService.clearAllData();
            setTrainingData([]);
            setStats({ total: 0, recent: 0, thisWeek: 0 });
            Alert.alert('Success', 'All training data has been cleared.');
          },
        },
      ]
    );
  };

  const deleteTrainingItem = (itemId) => {
    Alert.alert(
      'Delete Training Item',
      'Are you sure you want to delete this training example?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await TrainingDataService.deleteTrainingItem(itemId);
            loadTrainingData();
          },
        },
      ]
    );
  };

  const exportTrainingData = () => {
    const exportData = TrainingDataService.exportData();
    const dataStr = JSON.stringify(exportData, null, 2);
    console.log('Training Data Export:', dataStr);
    
    // In a real app, you might want to share this data or send it to a server
    Alert.alert(
      'Export Complete', 
      `Exported ${exportData.data.length} training examples to console. In a production app, this would be sent to your training service.`,
      [{ text: 'OK' }]
    );
  };

  const renderTrainingItem = ({ item }) => {
    const { originalText, manualParsing, timestamp } = item;
    const date = new Date(timestamp).toLocaleDateString();
    const time = new Date(timestamp).toLocaleTimeString();

    return (
      <View style={styles.trainingItem}>
        <View style={styles.trainingHeader}>
          <Text style={styles.originalText}>"{originalText}"</Text>
          <TouchableOpacity 
            onPress={() => deleteTrainingItem(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash" size={16} color={colors.error || colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.parsingResult}>
          <View style={styles.parsedPart}>
            <Text style={styles.partLabel}>Quantity:</Text>
            <Text style={styles.partValue}>{manualParsing.quantity || 'none'}</Text>
          </View>
          <View style={styles.parsedPart}>
            <Text style={styles.partLabel}>Unit:</Text>
            <Text style={styles.partValue}>{manualParsing.unit || 'none'}</Text>
          </View>
          <View style={styles.parsedPart}>
            <Text style={styles.partLabel}>Ingredient:</Text>
            <Text style={styles.partValue}>{manualParsing.ingredient || 'none'}</Text>
          </View>
          <View style={styles.parsedPart}>
            <Text style={styles.partLabel}>Description:</Text>
            <Text style={styles.partValue}>{manualParsing.description || 'none'}</Text>
          </View>
          {manualParsing.action && (
            <View style={styles.parsedPart}>
              <Text style={styles.partLabel}>Action:</Text>
              <Text style={[styles.partValue, styles.actionValue]}>{manualParsing.action}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timestamp}>{date} at {time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Parsing Training Data</Text>
          <Text style={styles.subtitle}>
            Manual corrections to improve ingredient parsing
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Examples</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.recent}</Text>
            <Text style={styles.statLabel}>Added Today</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={exportTrainingData}>
            <Ionicons name="download" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllTrainingData}
          >
            <Ionicons name="trash" size={20} color={colors.error || colors.textSecondary} />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Training Data List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Training Examples</Text>
          
          {trainingData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No training data yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Use the training tool on ingredients to build parsing examples
              </Text>
            </View>
          ) : (
            <FlatList
              data={trainingData}
              renderItem={renderTrainingItem}
              keyExtractor={item => item.id.toString()}
              style={styles.trainingList}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  header: {
    paddingTop: 0,
    paddingBottom: 20,
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

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...commonStyles.shadow,
  },

  statNumber: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dangerButton: {
    borderColor: colors.error || colors.border,
  },

  actionButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },

  dangerButtonText: {
    color: colors.error || colors.textSecondary,
  },

  // List
  listContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },

  trainingList: {
    flex: 1,
  },

  trainingItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    ...commonStyles.shadow,
  },

  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  originalText: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },

  deleteButton: {
    padding: 4,
  },

  parsingResult: {
    gap: 8,
    marginBottom: 12,
  },

  parsedPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  partLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 80,
  },

  partValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontStyle: 'italic',
  },

  actionValue: {
    color: colors.info || '#3B82F6',
    fontWeight: '500',
  },

  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },

  emptyStateText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});