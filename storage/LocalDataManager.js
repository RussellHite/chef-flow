/**
 * Local Data Manager for Ingredient Learning Data Collection
 * 
 * Handles all local storage operations using AsyncStorage
 * Optimized for performance with batching and compression
 * Supports offline operation with sync queue management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENT_TYPES } from '../models/DataSchema';

// Storage keys
const STORAGE_KEYS = {
  EVENTS: 'ingredient_learning_events',
  SESSIONS: 'ingredient_learning_sessions',
  USER_PREFERENCES: 'ingredient_learning_preferences',
  SYNC_QUEUE: 'ingredient_learning_sync_queue',
  METADATA: 'ingredient_learning_metadata',
  SETTINGS: 'ingredient_learning_settings'
};

// Configuration
const CONFIG = {
  MAX_EVENTS_PER_BATCH: 100,
  MAX_STORAGE_SIZE_MB: 50,
  BATCH_WRITE_DELAY: 1000, // 1 second
  COMPRESSION_ENABLED: true,
  AUTO_CLEANUP_DAYS: 90,
  MAX_SYNC_RETRIES: 3
};

class LocalDataManager {
  constructor() {
    this.writeQueue = [];
    this.batchTimer = null;
    this.isWriting = false;
    this.storageStats = {
      totalEvents: 0,
      storageSize: 0,
      lastCleanup: Date.now()
    };
    
    this.initialize();
  }

  /**
   * Initialize the data manager
   */
  async initialize() {
    try {
      await this.loadMetadata();
      await this.scheduleAutoCleanup();
      console.log('LocalDataManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LocalDataManager:', error);
    }
  }

  /**
   * Store a single event
   * @param {Object} event - Event object following DataSchema
   */
  async storeEvent(event) {
    try {
      // Validate event structure
      if (!this.validateEvent(event)) {
        console.warn('Invalid event structure:', event);
        return false;
      }

      // Add to write queue for batching
      this.writeQueue.push({
        type: 'event',
        data: event,
        timestamp: Date.now()
      });

      // Trigger batch write
      this.scheduleBatchWrite();
      
      return true;
    } catch (error) {
      console.error('Failed to store event:', error);
      return false;
    }
  }

  /**
   * Store multiple events in batch
   * @param {Array} events - Array of event objects
   */
  async storeEventsBatch(events) {
    try {
      const validEvents = events.filter(event => this.validateEvent(event));
      
      if (validEvents.length === 0) {
        console.warn('No valid events in batch');
        return false;
      }

      // Add to write queue
      validEvents.forEach(event => {
        this.writeQueue.push({
          type: 'event',
          data: event,
          timestamp: Date.now()
        });
      });

      // Force immediate write for large batches
      if (this.writeQueue.length >= CONFIG.MAX_EVENTS_PER_BATCH) {
        await this.processBatchWrite();
      } else {
        this.scheduleBatchWrite();
      }

      return true;
    } catch (error) {
      console.error('Failed to store events batch:', error);
      return false;
    }
  }

  /**
   * Retrieve events by criteria
   * @param {Object} criteria - Search criteria
   */
  async getEvents(criteria = {}) {
    try {
      const allEvents = await this.getAllEvents();
      return this.filterEvents(allEvents, criteria);
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  /**
   * Get events by date range
   * @param {number} startDate - Start timestamp
   * @param {number} endDate - End timestamp
   */
  async getEventsByDateRange(startDate, endDate) {
    return this.getEvents({
      startDate,
      endDate
    });
  }

  /**
   * Get events by type
   * @param {string} eventType - Event type from EVENT_TYPES
   */
  async getEventsByType(eventType) {
    return this.getEvents({
      eventType
    });
  }

  /**
   * Get events by session
   * @param {string} sessionId - Session ID
   */
  async getEventsBySession(sessionId) {
    return this.getEvents({
      sessionId
    });
  }

  /**
   * Get unsynced events for upload
   */
  async getUnsyncedEvents() {
    return this.getEvents({
      synced: false
    });
  }

  /**
   * Mark events as synced
   * @param {Array} eventIds - Array of event IDs
   */
  async markEventsSynced(eventIds) {
    try {
      const allEvents = await this.getAllEvents();
      let updated = false;

      const updatedEvents = allEvents.map(event => {
        if (eventIds.includes(event.id)) {
          updated = true;
          return {
            ...event,
            synced: true,
            syncedAt: Date.now()
          };
        }
        return event;
      });

      if (updated) {
        await this.saveAllEvents(updatedEvents);
      }

      return updated;
    } catch (error) {
      console.error('Failed to mark events as synced:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const allEvents = await this.getAllEvents();
      const storageSize = await this.calculateStorageSize();
      
      const stats = {
        totalEvents: allEvents.length,
        unsyncedEvents: allEvents.filter(e => !e.synced).length,
        storageSize,
        eventsByType: this.groupEventsByType(allEvents),
        dateRange: this.getDateRange(allEvents),
        lastUpdate: Date.now()
      };

      // Update cached stats
      this.storageStats = stats;
      await this.saveMetadata();

      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return this.storageStats;
    }
  }

  /**
   * Export all data for backup or analysis
   * @param {Object} options - Export options
   */
  async exportData(options = {}) {
    try {
      const { 
        includeEvents = true,
        includeSessions = true,
        includePreferences = true,
        format = 'json',
        dateRange = null
      } = options;

      const exportData = {
        metadata: {
          exportDate: Date.now(),
          version: '1.0.0',
          format
        }
      };

      if (includeEvents) {
        let events = await this.getAllEvents();
        if (dateRange) {
          events = events.filter(e => 
            e.timestamp >= dateRange.start && e.timestamp <= dateRange.end
          );
        }
        exportData.events = events;
      }

      if (includeSessions) {
        exportData.sessions = await this.getAllSessions();
      }

      if (includePreferences) {
        exportData.preferences = await this.getUserPreferences();
      }

      return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Import data from backup
   * @param {string|Object} data - Data to import
   * @param {Object} options - Import options
   */
  async importData(data, options = {}) {
    try {
      const { 
        mergeMode = 'append', // 'append', 'replace', 'merge'
        validateData = true 
      } = options;

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      if (validateData && !this.validateImportData(parsedData)) {
        throw new Error('Invalid import data structure');
      }

      if (mergeMode === 'replace') {
        await this.clearAllData();
      }

      // Import events
      if (parsedData.events) {
        if (mergeMode === 'merge') {
          const existingEvents = await this.getAllEvents();
          const existingIds = new Set(existingEvents.map(e => e.id));
          const newEvents = parsedData.events.filter(e => !existingIds.has(e.id));
          await this.storeEventsBatch(newEvents);
        } else {
          await this.storeEventsBatch(parsedData.events);
        }
      }

      // Import sessions
      if (parsedData.sessions) {
        await this.saveAllSessions(parsedData.sessions);
      }

      // Import preferences
      if (parsedData.preferences) {
        await this.saveUserPreferences(parsedData.preferences);
      }

      await this.updateMetadata();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Clear old data based on retention policy
   */
  async cleanupOldData() {
    try {
      const cutoffDate = Date.now() - (CONFIG.AUTO_CLEANUP_DAYS * 24 * 60 * 60 * 1000);
      const allEvents = await this.getAllEvents();
      
      const recentEvents = allEvents.filter(event => 
        event.timestamp > cutoffDate || !event.synced
      );

      if (recentEvents.length < allEvents.length) {
        await this.saveAllEvents(recentEvents);
        console.log(`Cleaned up ${allEvents.length - recentEvents.length} old events`);
      }

      this.storageStats.lastCleanup = Date.now();
      await this.saveMetadata();
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      return false;
    }
  }

  /**
   * Get user preferences for data collection
   */
  async getUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Save user preferences
   * @param {Object} preferences - User preferences object
   */
  async saveUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES, 
        JSON.stringify(preferences)
      );
      return true;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      return false;
    }
  }

  /**
   * Private Methods
   */

  async getAllEvents() {
    try {
      const events = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to get all events:', error);
      return [];
    }
  }

  async saveAllEvents(events) {
    try {
      const dataToStore = CONFIG.COMPRESSION_ENABLED 
        ? this.compressData(events)
        : JSON.stringify(events);
      
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, dataToStore);
      return true;
    } catch (error) {
      console.error('Failed to save all events:', error);
      return false;
    }
  }

  async getAllSessions() {
    try {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  async saveAllSessions(sessions) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Failed to save all sessions:', error);
      return false;
    }
  }

  scheduleBatchWrite() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatchWrite();
    }, CONFIG.BATCH_WRITE_DELAY);
  }

  async processBatchWrite() {
    if (this.isWriting || this.writeQueue.length === 0) {
      return;
    }

    this.isWriting = true;
    try {
      const events = this.writeQueue.splice(0, CONFIG.MAX_EVENTS_PER_BATCH);
      const eventData = events.map(item => item.data);
      
      const existingEvents = await this.getAllEvents();
      const updatedEvents = [...existingEvents, ...eventData];
      
      await this.saveAllEvents(updatedEvents);
      
      // Update stats
      this.storageStats.totalEvents = updatedEvents.length;
      
    } catch (error) {
      console.error('Failed to process batch write:', error);
    } finally {
      this.isWriting = false;
      
      // Process remaining queue if any
      if (this.writeQueue.length > 0) {
        this.scheduleBatchWrite();
      }
    }
  }

  validateEvent(event) {
    return event && 
           event.id && 
           event.sessionId && 
           event.timestamp && 
           event.eventType && 
           Object.values(EVENT_TYPES).includes(event.eventType);
  }

  filterEvents(events, criteria) {
    return events.filter(event => {
      if (criteria.eventType && event.eventType !== criteria.eventType) {
        return false;
      }
      if (criteria.sessionId && event.sessionId !== criteria.sessionId) {
        return false;
      }
      if (criteria.startDate && event.timestamp < criteria.startDate) {
        return false;
      }
      if (criteria.endDate && event.timestamp > criteria.endDate) {
        return false;
      }
      if (criteria.synced !== undefined && event.synced !== criteria.synced) {
        return false;
      }
      return true;
    });
  }

  groupEventsByType(events) {
    return events.reduce((groups, event) => {
      const type = event.eventType;
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
  }

  getDateRange(events) {
    if (events.length === 0) return null;
    
    const timestamps = events.map(e => e.timestamp).sort((a, b) => a - b);
    return {
      earliest: timestamps[0],
      latest: timestamps[timestamps.length - 1]
    };
  }

  async calculateStorageSize() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      let totalSize = 0;
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  compressData(data) {
    // Simple compression - in production, consider using a compression library
    return JSON.stringify(data);
  }

  async loadMetadata() {
    try {
      const metadata = await AsyncStorage.getItem(STORAGE_KEYS.METADATA);
      if (metadata) {
        this.storageStats = { ...this.storageStats, ...JSON.parse(metadata) };
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  }

  async saveMetadata() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.METADATA, 
        JSON.stringify(this.storageStats)
      );
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  }

  async updateMetadata() {
    await this.getStorageStats(); // This updates and saves metadata
  }

  async scheduleAutoCleanup() {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }

  getDefaultPreferences() {
    return {
      dataCollectionEnabled: true,
      syncEnabled: true,
      anonymizeData: false,
      retentionDays: CONFIG.AUTO_CLEANUP_DAYS,
      consentGiven: false,
      consentDate: null,
      privacyVersion: '1.0.0'
    };
  }

  validateImportData(data) {
    return data && 
           data.metadata && 
           (data.events || data.sessions || data.preferences);
  }

  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      this.storageStats = {
        totalEvents: 0,
        storageSize: 0,
        lastCleanup: Date.now()
      };
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }
}

// Singleton instance
let dataManagerInstance = null;

export const getDataManager = () => {
  if (!dataManagerInstance) {
    dataManagerInstance = new LocalDataManager();
  }
  return dataManagerInstance;
};

export default LocalDataManager;