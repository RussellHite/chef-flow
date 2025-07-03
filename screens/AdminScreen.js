import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  LinearGradient,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function AdminScreen({ navigation }) {
  const [autoParsingEnabled, setAutoParsingEnabled] = useState(true);
  const [debugModeEnabled, setDebugModeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  const adminStats = {
    totalIngredients: 170,
    parsingAccuracy: 92,
    activeUsers: 1,
    recipesProcessed: 47
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: 'person', 
          label: 'Profile', 
          description: 'Manage your account details', 
          action: () => {},
          incomplete: true
        },
        { 
          icon: 'notifications', 
          label: 'Notifications', 
          description: 'Configure alerts and updates', 
          action: () => {},
          incomplete: true
        },
      ]
    },
    {
      title: 'Admin Tools',
      items: [
        { 
          icon: 'server', 
          label: 'Ingredient Database', 
          description: `Manage ${adminStats.totalIngredients} ingredients`,
          badge: 'Admin',
          action: () => navigation.navigate('IngredientList')
        },
        { 
          icon: 'flash', 
          label: 'Recipe Parser', 
          description: `${adminStats.parsingAccuracy}% accuracy rate`,
          badge: 'Admin',
          action: () => console.log('Parsing training feature removed'),
          incomplete: true
        },
        { 
          icon: 'grid', 
          label: 'Categories', 
          description: 'Manage ingredient categories',
          badge: 'Admin',
          action: () => console.log('Categories page coming soon'),
          incomplete: true
        },
        { 
          icon: 'scale', 
          label: 'Units & Measurements', 
          description: 'View and edit measurement units',
          badge: 'Admin',
          action: () => console.log('Units page coming soon'),
          incomplete: true
        },
      ]
    },
    {
      title: 'Application',
      items: [
        { 
          icon: 'shield', 
          label: 'Privacy & Security', 
          description: 'Data and security settings', 
          action: () => {},
          incomplete: true
        },
        { 
          icon: 'help-circle', 
          label: 'Help & Support', 
          description: 'Documentation and support', 
          action: () => {},
          incomplete: true
        },
      ]
    }
  ];

  const renderStatsCard = () => (
    <View style={styles.adminStatsCard}>
      <View style={styles.statsHeader}>
        <Ionicons name="shield" size={20} color={colors.surface} />
        <Text style={styles.statsTitle}>Admin Dashboard</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{adminStats.totalIngredients}</Text>
          <Text style={styles.statLabel}>Ingredients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{adminStats.parsingAccuracy}%</Text>
          <Text style={styles.statLabel}>Parse Accuracy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{adminStats.activeUsers}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{adminStats.recipesProcessed}</Text>
          <Text style={styles.statLabel}>Recipes Processed</Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = (section) => (
    <View key={section.title} style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionCard}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.settingItem,
              index !== section.items.length - 1 && styles.settingItemBorder
            ]}
            onPress={item.action}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.settingText}>
                <View style={styles.settingLabelRow}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {item.incomplete && (
                    <View style={styles.incompleteBadge}>
                      <Text style={styles.incompleteBadgeText}>?</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsList}>
        <View style={styles.quickActionItem}>
          <View>
            <Text style={styles.quickActionLabel}>Auto-parsing</Text>
            <Text style={styles.quickActionDescription}>Automatically parse new recipes</Text>
          </View>
          <Switch
            value={autoParsingEnabled}
            onValueChange={setAutoParsingEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
        
        <View style={styles.quickActionItem}>
          <View>
            <Text style={styles.quickActionLabel}>Debug mode</Text>
            <Text style={styles.quickActionDescription}>Show detailed parsing information</Text>
          </View>
          <Switch
            value={debugModeEnabled}
            onValueChange={setDebugModeEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
        
        <View style={styles.quickActionItem}>
          <View>
            <Text style={styles.quickActionLabel}>Notifications</Text>
            <Text style={styles.quickActionDescription}>Receive parsing status updates</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin Access</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Admin Dashboard Stats */}
          {renderStatsCard()}
          
          {/* Settings Sections */}
          <View style={styles.settingsSections}>
            {settingsSections.map(renderSettingsSection)}
          </View>
          
          {/* Quick Actions */}
          {renderQuickActions()}
          
          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Chef Flow v1.0.0</Text>
            <Text style={styles.appInfoText}>Recipe parsing and workflow management</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 24,
  },
  adminBadge: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Admin Stats Card
  adminStatsCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    ...commonStyles.shadow,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.surface,
    marginLeft: 8,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    ...typography.h1,
    color: colors.surface,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: `${colors.surface}B3`,
    fontSize: 12,
  },
  
  // Settings Sections
  settingsSections: {
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...commonStyles.shadow,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingLabel: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: `${colors.accent}1A`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  incompleteBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  incompleteBadgeText: {
    ...typography.caption,
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // Quick Actions
  quickActionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    ...commonStyles.shadow,
  },
  quickActionsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
    fontWeight: '600',
  },
  quickActionsList: {
    gap: 16,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  quickActionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  // App Info
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  appInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});