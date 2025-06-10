/**
 * PrivacyControls Component
 * 
 * Provides comprehensive privacy management for ingredient learning data collection
 * Allows users to control data sharing, retention, and export preferences
 * Implements GDPR-like privacy controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const PRIVACY_SETTINGS_KEY = 'ingredient_learning_privacy_settings';

const DEFAULT_PRIVACY_SETTINGS = {
  dataCollection: {
    enabled: true,
    searchTracking: true,
    selectionTracking: true,
    correctionTracking: true,
    combinationTracking: true,
    feedbackTracking: true
  },
  dataSharing: {
    allowAnonymousSharing: false,
    allowResearchUse: false,
    allowProductImprovement: true
  },
  dataRetention: {
    retentionPeriodDays: 90,
    autoDeleteAfterDays: 365,
    anonymizeAfterDays: 30
  },
  advanced: {
    compressionEnabled: true,
    localStorageOnly: false,
    syncEnabled: true,
    telemetryEnabled: true
  },
  consent: {
    consentDate: null,
    consentVersion: '1.0',
    hasGivenConsent: false
  }
};

export default function PrivacyControls({ onSettingsChange }) {
  const [settings, setSettings] = useState(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        const mergedSettings = {
          ...DEFAULT_PRIVACY_SETTINGS,
          ...parsedSettings,
          dataCollection: { ...DEFAULT_PRIVACY_SETTINGS.dataCollection, ...parsedSettings.dataCollection },
          dataSharing: { ...DEFAULT_PRIVACY_SETTINGS.dataSharing, ...parsedSettings.dataSharing },
          dataRetention: { ...DEFAULT_PRIVACY_SETTINGS.dataRetention, ...parsedSettings.dataRetention },
          advanced: { ...DEFAULT_PRIVACY_SETTINGS.advanced, ...parsedSettings.advanced },
          consent: { ...DEFAULT_PRIVACY_SETTINGS.consent, ...parsedSettings.consent }
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings');
    }
  };

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    savePrivacySettings(newSettings);
  };

  const handleConsentUpdate = (hasConsent) => {
    if (hasConsent) {
      const newSettings = {
        ...settings,
        consent: {
          ...settings.consent,
          hasGivenConsent: true,
          consentDate: Date.now(),
          consentVersion: '1.0'
        }
      };
      savePrivacySettings(newSettings);
    } else {
      // Revoke consent - disable all data collection
      const newSettings = {
        ...settings,
        dataCollection: {
          enabled: false,
          searchTracking: false,
          selectionTracking: false,
          correctionTracking: false,
          combinationTracking: false,
          feedbackTracking: false
        },
        dataSharing: {
          allowAnonymousSharing: false,
          allowResearchUse: false,
          allowProductImprovement: false
        },
        consent: {
          ...settings.consent,
          hasGivenConsent: false,
          consentDate: Date.now()
        }
      };
      savePrivacySettings(newSettings);
    }
    setShowConsentModal(false);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your ingredient learning data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all ingredient tracking data
              const keys = await AsyncStorage.getAllKeys();
              const trackingKeys = keys.filter(key => 
                key.startsWith('ingredient_') || 
                key.startsWith('tracking_') ||
                key.startsWith('sync_')
              );
              
              if (trackingKeys.length > 0) {
                await AsyncStorage.multiRemove(trackingKeys);
              }
              
              Alert.alert('Success', 'All ingredient learning data has been deleted');
            } catch (error) {
              console.error('Failed to delete data:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      // Get all tracking data
      const keys = await AsyncStorage.getAllKeys();
      const trackingKeys = keys.filter(key => 
        key.startsWith('ingredient_') || 
        key.startsWith('tracking_')
      );
      
      if (trackingKeys.length === 0) {
        Alert.alert('No Data', 'No ingredient learning data found to export');
        return;
      }

      const dataToExport = {};
      for (const key of trackingKeys) {
        const value = await AsyncStorage.getItem(key);
        dataToExport[key] = value ? JSON.parse(value) : null;
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        dataCount: trackingKeys.length,
        privacySettings: settings,
        data: dataToExport
      };

      // In a real app, you would use a file sharing library or email
      console.log('Exported data:', JSON.stringify(exportData, null, 2));
      
      Alert.alert(
        'Data Exported',
        `Your data has been exported (${trackingKeys.length} items). Check the console for the full export.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const renderSectionHeader = (title, subtitle) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderToggleItem = (title, subtitle, value, onValueChange, category, key) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => onValueChange(category, key, newValue)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.surface : colors.textSecondary}
      />
    </View>
  );

  const renderConsentModal = () => (
    <Modal
      visible={showConsentModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Data Collection Consent</Text>
          
          <Text style={styles.consentText}>
            Chef Flow can learn from your ingredient interactions to improve recipe suggestions and parsing accuracy.
          </Text>
          
          <View style={styles.consentSection}>
            <Text style={styles.consentSectionTitle}>What we collect:</Text>
            <Text style={styles.consentItem}>• Ingredient searches and selections</Text>
            <Text style={styles.consentItem}>• Recipe creation patterns</Text>
            <Text style={styles.consentItem}>• Ingredient corrections and feedback</Text>
            <Text style={styles.consentItem}>• Usage analytics (anonymous)</Text>
          </View>
          
          <View style={styles.consentSection}>
            <Text style={styles.consentSectionTitle}>How we use it:</Text>
            <Text style={styles.consentItem}>• Improve ingredient recognition</Text>
            <Text style={styles.consentItem}>• Better recipe suggestions</Text>
            <Text style={styles.consentItem}>• Enhanced app performance</Text>
            <Text style={styles.consentItem}>• Optional research (with your permission)</Text>
          </View>
          
          <View style={styles.consentSection}>
            <Text style={styles.consentSectionTitle}>Your rights:</Text>
            <Text style={styles.consentItem}>• View, export, or delete your data anytime</Text>
            <Text style={styles.consentItem}>• Change privacy settings anytime</Text>
            <Text style={styles.consentItem}>• Revoke consent anytime</Text>
            <Text style={styles.consentItem}>• Data is stored locally by default</Text>
          </View>
        </ScrollView>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonSecondary]} 
            onPress={() => handleConsentUpdate(false)}
          >
            <Text style={styles.modalButtonTextSecondary}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonPrimary]} 
            onPress={() => handleConsentUpdate(true)}
          >
            <Text style={styles.modalButtonTextPrimary}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Consent Status */}
      <View style={styles.section}>
        {renderSectionHeader('Consent Status', 'Manage your data collection consent')}
        
        <View style={styles.consentStatus}>
          <View style={styles.consentStatusInfo}>
            <Ionicons 
              name={settings.consent.hasGivenConsent ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={settings.consent.hasGivenConsent ? colors.success || colors.primary : colors.warning || colors.textSecondary} 
            />
            <View style={styles.consentStatusText}>
              <Text style={styles.consentStatusTitle}>
                {settings.consent.hasGivenConsent ? 'Consent Given' : 'Consent Required'}
              </Text>
              <Text style={styles.consentStatusSubtitle}>
                {settings.consent.hasGivenConsent 
                  ? `Given on ${new Date(settings.consent.consentDate).toLocaleDateString()}`
                  : 'Data collection is disabled'
                }
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.consentButton}
            onPress={() => setShowConsentModal(true)}
          >
            <Text style={styles.consentButtonText}>
              {settings.consent.hasGivenConsent ? 'Update' : 'Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Collection Settings */}
      {settings.consent.hasGivenConsent && (
        <View style={styles.section}>
          {renderSectionHeader('Data Collection', 'Control what data is collected')}
          
          {renderToggleItem(
            'Enable Data Collection',
            'Master switch for all ingredient learning',
            settings.dataCollection.enabled,
            updateSetting,
            'dataCollection',
            'enabled'
          )}
          
          {settings.dataCollection.enabled && (
            <>
              {renderToggleItem(
                'Search Tracking',
                'Track ingredient searches and results',
                settings.dataCollection.searchTracking,
                updateSetting,
                'dataCollection',
                'searchTracking'
              )}
              
              {renderToggleItem(
                'Selection Tracking',
                'Track ingredient selections and deselections',
                settings.dataCollection.selectionTracking,
                updateSetting,
                'dataCollection',
                'selectionTracking'
              )}
              
              {renderToggleItem(
                'Correction Tracking',
                'Track ingredient corrections and edits',
                settings.dataCollection.correctionTracking,
                updateSetting,
                'dataCollection',
                'correctionTracking'
              )}
              
              {renderToggleItem(
                'Combination Tracking',
                'Track ingredient combinations in recipes',
                settings.dataCollection.combinationTracking,
                updateSetting,
                'dataCollection',
                'combinationTracking'
              )}
              
              {renderToggleItem(
                'Feedback Tracking',
                'Track ratings and feedback on ingredients',
                settings.dataCollection.feedbackTracking,
                updateSetting,
                'dataCollection',
                'feedbackTracking'
              )}
            </>
          )}
        </View>
      )}

      {/* Data Sharing Settings */}
      {settings.consent.hasGivenConsent && settings.dataCollection.enabled && (
        <View style={styles.section}>
          {renderSectionHeader('Data Sharing', 'Control how your data is used')}
          
          {renderToggleItem(
            'Anonymous Sharing',
            'Share anonymized data to improve the app',
            settings.dataSharing.allowAnonymousSharing,
            updateSetting,
            'dataSharing',
            'allowAnonymousSharing'
          )}
          
          {renderToggleItem(
            'Research Use',
            'Allow data use for food science research',
            settings.dataSharing.allowResearchUse,
            updateSetting,
            'dataSharing',
            'allowResearchUse'
          )}
          
          {renderToggleItem(
            'Product Improvement',
            'Help improve Chef Flow features',
            settings.dataSharing.allowProductImprovement,
            updateSetting,
            'dataSharing',
            'allowProductImprovement'
          )}
        </View>
      )}

      {/* Data Management */}
      <View style={styles.section}>
        {renderSectionHeader('Data Management', 'Control your stored data')}
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Export My Data</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAllData}>
          <Ionicons name="trash-outline" size={20} color={colors.error || colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.error || colors.textSecondary }]}>
            Delete All Data
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Advanced Settings */}
      {settings.consent.hasGivenConsent && (
        <View style={styles.section}>
          {renderSectionHeader('Advanced', 'Technical and storage options')}
          
          {renderToggleItem(
            'Data Compression',
            'Compress stored data to save space',
            settings.advanced.compressionEnabled,
            updateSetting,
            'advanced',
            'compressionEnabled'
          )}
          
          {renderToggleItem(
            'Local Storage Only',
            'Never sync data to external servers',
            settings.advanced.localStorageOnly,
            updateSetting,
            'advanced',
            'localStorageOnly'
          )}
          
          {!settings.advanced.localStorageOnly && renderToggleItem(
            'Background Sync',
            'Sync data when online (respects sharing settings)',
            settings.advanced.syncEnabled,
            updateSetting,
            'advanced',
            'syncEnabled'
          )}
        </View>
      )}

      {renderConsentModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  consentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  consentStatusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  consentStatusText: {
    marginLeft: 12,
  },
  consentStatusTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  consentStatusSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  consentButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  consentButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  consentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  consentSection: {
    marginBottom: 24,
  },
  consentSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  consentItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.background,
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
    fontWeight: '600',
  },
});