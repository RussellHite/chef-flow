/**
 * DataVisualizationDashboard Component
 * 
 * Provides insights and visualizations for ingredient learning data
 * Shows user patterns, popular ingredients, cooking trends, and system performance
 * Helps users understand their cooking habits and data contribution
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const { width: screenWidth } = Dimensions.get('window');

export default function DataVisualizationDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get all ingredient tracking data
      const keys = await AsyncStorage.getAllKeys();
      const trackingKeys = keys.filter(key => 
        key.startsWith('ingredient_') || 
        key.startsWith('tracking_')
      );

      if (trackingKeys.length === 0) {
        setAnalytics(getEmptyAnalytics());
        return;
      }

      // Load and analyze data
      const analyticsData = await analyzeTrackingData(trackingKeys);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(getEmptyAnalytics());
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const analyzeTrackingData = async (keys) => {
    const data = {
      events: [],
      sessions: [],
      ingredients: {},
      recipes: {},
      timeline: {}
    };

    // Load all tracking data
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          
          if (key.includes('events')) {
            data.events = data.events.concat(parsed.events || []);
          } else if (key.includes('sessions')) {
            data.sessions = data.sessions.concat(parsed.sessions || []);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse ${key}:`, error);
      }
    }

    // Analyze the data
    return analyzeDataPatterns(data);
  };

  const analyzeDataPatterns = (data) => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    // Time-based filtering
    const thisWeek = data.events.filter(e => (now - e.timestamp) < weekMs);
    const thisMonth = data.events.filter(e => (now - e.timestamp) < monthMs);

    // Event type analysis
    const eventTypes = {};
    data.events.forEach(event => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });

    // Ingredient frequency analysis
    const ingredientFreq = {};
    const ingredientSearches = data.events.filter(e => e.eventType === 'ingredient_search');
    const ingredientSelections = data.events.filter(e => e.eventType === 'ingredient_select');

    ingredientSelections.forEach(event => {
      const name = event.data?.ingredientName || 'Unknown';
      ingredientFreq[name] = (ingredientFreq[name] || 0) + 1;
    });

    // Popular search terms
    const searchTerms = {};
    ingredientSearches.forEach(event => {
      const query = event.data?.query?.toLowerCase();
      if (query) {
        searchTerms[query] = (searchTerms[query] || 0) + 1;
      }
    });

    // Time of day patterns
    const hourlyPattern = Array(24).fill(0);
    data.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyPattern[hour]++;
    });

    // Day of week patterns
    const dailyPattern = Array(7).fill(0);
    data.events.forEach(event => {
      const day = new Date(event.timestamp).getDay();
      dailyPattern[day]++;
    });

    // Cooking context analysis
    const contextAnalysis = {};
    data.events.forEach(event => {
      const context = event.data?.contextType || 'unknown';
      contextAnalysis[context] = (contextAnalysis[context] || 0) + 1;
    });

    // Quality metrics
    const corrections = data.events.filter(e => e.eventType === 'ingredient_correction');
    const feedback = data.events.filter(e => e.eventType === 'user_feedback');
    const positiveFeedback = feedback.filter(e => ['like', 'love'].includes(e.data?.feedbackType));

    return {
      overview: {
        totalEvents: data.events.length,
        totalSessions: data.sessions.length,
        eventsThisWeek: thisWeek.length,
        eventsThisMonth: thisMonth.length,
        uniqueIngredients: Object.keys(ingredientFreq).length,
        averageEventsPerSession: data.sessions.length > 0 ? data.events.length / data.sessions.length : 0
      },
      eventTypes,
      ingredients: {
        frequency: ingredientFreq,
        topIngredients: Object.entries(ingredientFreq)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        searchTerms: Object.entries(searchTerms)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      },
      patterns: {
        hourly: hourlyPattern,
        daily: dailyPattern,
        peakHour: hourlyPattern.indexOf(Math.max(...hourlyPattern)),
        peakDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dailyPattern.indexOf(Math.max(...dailyPattern))]
      },
      contexts: contextAnalysis,
      quality: {
        corrections: corrections.length,
        feedback: feedback.length,
        positiveRatio: feedback.length > 0 ? positiveFeedback.length / feedback.length : 0,
        learningScore: Math.min(100, Math.round((data.events.length / 100) * 100))
      },
      timeline: generateTimeline(data.events),
      lastUpdated: Date.now()
    };
  };

  const generateTimeline = (events) => {
    const timeline = {};
    const dayMs = 24 * 60 * 60 * 1000;
    
    events.forEach(event => {
      const dateKey = new Date(event.timestamp).toISOString().split('T')[0];
      if (!timeline[dateKey]) {
        timeline[dateKey] = { count: 0, events: [] };
      }
      timeline[dateKey].count++;
      timeline[dateKey].events.push(event);
    });

    return timeline;
  };

  const getEmptyAnalytics = () => ({
    overview: {
      totalEvents: 0,
      totalSessions: 0,
      eventsThisWeek: 0,
      eventsThisMonth: 0,
      uniqueIngredients: 0,
      averageEventsPerSession: 0
    },
    eventTypes: {},
    ingredients: { frequency: {}, topIngredients: [], searchTerms: [] },
    patterns: { hourly: Array(24).fill(0), daily: Array(7).fill(0), peakHour: 0, peakDay: 'N/A' },
    contexts: {},
    quality: { corrections: 0, feedback: 0, positiveRatio: 0, learningScore: 0 },
    timeline: {},
    lastUpdated: Date.now()
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  const renderOverviewCard = (title, value, subtitle, icon, color = colors.primary) => (
    <View style={[styles.overviewCard, { borderLeftColor: color }]}>
      <View style={styles.overviewCardContent}>
        <View style={styles.overviewCardHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={styles.overviewCardTitle}>{title}</Text>
        </View>
        <Text style={styles.overviewCardValue}>{value}</Text>
        {subtitle && <Text style={styles.overviewCardSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const renderBarChart = (data, labels, title) => {
    const maxValue = Math.max(...data);
    if (maxValue === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChart}>
          {data.map((value, index) => {
            const height = Math.max(4, (value / maxValue) * 100);
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.bar, { height: `${height}%` }]} />
                {labels && (
                  <Text style={styles.barLabel}>
                    {typeof labels[index] === 'string' ? labels[index] : index}
                  </Text>
                )}
                <Text style={styles.barValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTopList = (items, title, valueFormatter = (x) => x) => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyState}>No data available</Text>
      ) : (
        items.map(([name, count], index) => (
          <View key={name} style={styles.listItem}>
            <View style={styles.listItemRank}>
              <Text style={styles.listItemRankText}>#{index + 1}</Text>
            </View>
            <Text style={styles.listItemName}>{name}</Text>
            <Text style={styles.listItemValue}>{valueFormatter(count)}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.overviewGrid}>
        {renderOverviewCard(
          'Total Events',
          analytics.overview.totalEvents.toLocaleString(),
          'All time tracking',
          'analytics',
          colors.primary
        )}
        {renderOverviewCard(
          'This Week',
          analytics.overview.eventsThisWeek.toLocaleString(),
          'Recent activity',
          'calendar',
          colors.success || colors.primary
        )}
        {renderOverviewCard(
          'Ingredients',
          analytics.overview.uniqueIngredients.toLocaleString(),
          'Unique items tracked',
          'restaurant',
          colors.warning || colors.primary
        )}
        {renderOverviewCard(
          'Learning Score',
          `${analytics.quality.learningScore}%`,
          'Data contribution',
          'school',
          colors.error || colors.primary
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Patterns</Text>
        {renderBarChart(
          analytics.patterns.hourly,
          Array.from({ length: 24 }, (_, i) => i % 6 === 0 ? `${i}h` : ''),
          'Activity by Hour'
        )}
        {renderBarChart(
          analytics.patterns.daily,
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          'Activity by Day'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Peak Activity</Text>
            <Text style={styles.quickStatValue}>
              {analytics.patterns.peakDay} at {analytics.patterns.peakHour}:00
            </Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Corrections Made</Text>
            <Text style={styles.quickStatValue}>{analytics.quality.corrections}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>Positive Feedback</Text>
            <Text style={styles.quickStatValue}>
              {Math.round(analytics.quality.positiveRatio * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderIngredientsTab = () => (
    <ScrollView style={styles.tabContent}>
      {renderTopList(
        analytics.ingredients.topIngredients,
        'Most Used Ingredients',
        (count) => `${count} times`
      )}
      
      {renderTopList(
        analytics.ingredients.searchTerms,
        'Popular Search Terms',
        (count) => `${count} searches`
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context Breakdown</Text>
        <View style={styles.contextGrid}>
          {Object.entries(analytics.contexts).map(([context, count]) => (
            <View key={context} style={styles.contextItem}>
              <Text style={styles.contextName}>
                {context.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.contextCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderInsightsTab = () => {
    const insights = generateInsights(analytics);
    
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cooking Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Ionicons name={insight.icon} size={24} color={insight.color} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const generateInsights = (analytics) => {
    const insights = [];
    
    if (analytics.overview.totalEvents > 50) {
      insights.push({
        icon: 'star',
        color: colors.warning || colors.primary,
        title: 'Active Contributor',
        description: `You've generated ${analytics.overview.totalEvents} data points, helping improve the app for everyone!`
      });
    }
    
    if (analytics.quality.corrections > 10) {
      insights.push({
        icon: 'school',
        color: colors.success || colors.primary,
        title: 'Learning Helper',
        description: `Your ${analytics.quality.corrections} corrections are teaching the AI to be more accurate.`
      });
    }
    
    if (analytics.patterns.peakHour >= 17 && analytics.patterns.peakHour <= 20) {
      insights.push({
        icon: 'time',
        color: colors.primary,
        title: 'Evening Chef',
        description: 'You tend to cook most often in the evening hours. Perfect for family dinners!'
      });
    } else if (analytics.patterns.peakHour >= 6 && analytics.patterns.peakHour <= 10) {
      insights.push({
        icon: 'sunny',
        color: colors.warning || colors.primary,
        title: 'Morning Chef',
        description: 'You prefer cooking in the morning. Great for meal prep!'
      });
    }
    
    if (analytics.ingredients.topIngredients.length > 0) {
      const topIngredient = analytics.ingredients.topIngredients[0][0];
      insights.push({
        icon: 'restaurant',
        color: colors.error || colors.primary,
        title: 'Favorite Ingredient',
        description: `${topIngredient} appears most often in your recipes. You know what you like!`
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        icon: 'information-circle',
        color: colors.textSecondary,
        title: 'Keep Cooking!',
        description: 'Use the app more to see personalized insights about your cooking patterns.'
      });
    }
    
    return insights;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: 'analytics' },
          { key: 'ingredients', label: 'Ingredients', icon: 'restaurant' },
          { key: 'insights', label: 'Insights', icon: 'bulb' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedTab === tab.key ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.tabLabel,
              selectedTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'ingredients' && renderIngredientsTab()}
        {selectedTab === 'insights' && renderInsightsTab()}
      </ScrollView>
    </View>
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
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: (screenWidth - 44) / 2,
    borderLeftWidth: 4,
  },
  overviewCardContent: {
    alignItems: 'flex-start',
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  overviewCardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  overviewCardValue: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  overviewCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 2,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: colors.primary,
    width: '80%',
    borderRadius: 2,
    minHeight: 4,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  barValue: {
    ...typography.caption,
    color: colors.text,
    fontSize: 9,
    marginTop: 2,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  listTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemRank: {
    width: 32,
    alignItems: 'center',
  },
  listItemRankText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  listItemName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  listItemValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickStat: {
    flex: 1,
    minWidth: 100,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  quickStatValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contextItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  contextName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  contextCount: {
    ...typography.h3,
    color: colors.primary,
    marginTop: 4,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insightContent: {
    flex: 1,
    marginLeft: 16,
  },
  insightTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
  },
});