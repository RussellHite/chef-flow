import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Share,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import TrainingDataService from '../services/TrainingDataService';

export default function ParsingTrainingScreen({ navigation }) {
  const [trainingData, setTrainingData] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0 });
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

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

  const importTrainingData = async () => {
    try {
      // Try to get data from clipboard first
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setImportText(clipboardContent);
      }
      setShowImport(true);
    } catch (error) {
      console.error('Error getting clipboard:', error);
      setShowImport(true);
    }
  };

  const processImportData = async () => {
    try {
      const importData = JSON.parse(importText);
      
      // Validate the data structure
      if (!importData.data || !Array.isArray(importData.data)) {
        throw new Error('Invalid data format');
      }

      // Import each training example
      let imported = 0;
      for (const item of importData.data) {
        if (item.originalText && item.manualParsing) {
          await TrainingDataService.saveTrainingData(item.originalText, item.manualParsing);
          imported++;
        }
      }

      Alert.alert('Success', `Imported ${imported} training examples!`);
      setShowImport(false);
      setImportText('');
      loadTrainingData();
    } catch (error) {
      Alert.alert('Import Error', 'Invalid JSON format or data structure. Please check your data and try again.');
      console.error('Import error:', error);
    }
  };

  const exportTrainingData = async () => {
    const exportData = TrainingDataService.exportData();
    const dataStr = JSON.stringify(exportData, null, 2);
    
    try {
      // Try to share the data first
      const shareResult = await Share.share({
        message: dataStr,
        title: 'Chef Flow Training Data Export',
      });
      
      if (shareResult.action === Share.sharedAction) {
        console.log('Training data shared successfully');
      } else if (shareResult.action === Share.dismissedAction) {
        // User dismissed the share dialog, offer to copy to clipboard
        Alert.alert(
          'Export Cancelled',
          'Would you like to copy the data to clipboard instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Copy to Clipboard',
              onPress: async () => {
                await Clipboard.setStringAsync(dataStr);
                Alert.alert('Success', 'Training data copied to clipboard!');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing data:', error);
      // Fallback to clipboard
      Alert.alert(
        'Share Failed',
        'Unable to share data. Would you like to copy it to clipboard instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Copy to Clipboard',
            onPress: async () => {
              await Clipboard.setStringAsync(dataStr);
              Alert.alert('Success', 'Training data copied to clipboard!');
            }
          }
        ]
      );
    }
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
          <View style={styles.parsingGrid}>
            <View style={styles.parsedField}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <Text style={styles.fieldValue}>{manualParsing.quantity || 'none'}</Text>
            </View>
            <View style={styles.parsedField}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <Text style={styles.fieldValue}>{manualParsing.unit || 'none'}</Text>
            </View>
          </View>
          
          <View style={styles.parsedField}>
            <Text style={styles.fieldLabel}>Ingredient</Text>
            <Text style={styles.fieldValue}>{manualParsing.ingredient || 'none'}</Text>
          </View>
          
          {manualParsing.description && (
            <View style={styles.parsedField}>
              <Text style={styles.fieldLabel}>Description</Text>
              <Text style={styles.fieldValue}>{manualParsing.description}</Text>
            </View>
          )}
          
          {manualParsing.action && (
            <View style={styles.parsedField}>
              <Text style={styles.fieldLabel}>Action</Text>
              <Text style={[styles.fieldValue, styles.actionValue]}>{manualParsing.action}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timestamp}>{date} at {time}</Text>
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
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
          <TouchableOpacity style={styles.actionButton} onPress={importTrainingData}>
            <Ionicons name="download" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Import</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportTrainingData}>
            <Ionicons name="share" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={async () => {
              const exportData = TrainingDataService.exportData();
              const dataStr = JSON.stringify(exportData, null, 2);
              await Clipboard.setStringAsync(dataStr);
              Alert.alert('Success', `Copied ${exportData.data.length} training examples to clipboard!`);
            }}
          >
            <Ionicons name="copy" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Copy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllTrainingData}
          >
            <Ionicons name="trash" size={16} color={colors.error || colors.textSecondary} />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear</Text>
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

      {/* Import Modal */}
      <Modal
        visible={showImport}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Training Data</Text>
              <TouchableOpacity onPress={() => setShowImport(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Paste your training data JSON below:
            </Text>
            
            <TextInput
              style={styles.importTextInput}
              value={importText}
              onChangeText={setImportText}
              placeholder="Paste JSON data here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => {
                  setShowImport(false);
                  setImportText('');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={processImportData}
              >
                <Text style={styles.modalButtonTextPrimary}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  header: {
    marginTop: 20,
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
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  actionButton: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
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
    marginBottom: 12,
  },

  parsingGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  parsedField: {
    flex: 1,
    marginBottom: 12,
  },

  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 0,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  fieldValue: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
    marginTop: 0,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...commonStyles.shadow,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },

  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  importTextInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    minHeight: 200,
    maxHeight: 300,
    ...typography.body,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },

  modalButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalButtonTextPrimary: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },

  modalButtonTextSecondary: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
});