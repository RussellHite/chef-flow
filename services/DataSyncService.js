/**
 * DataSyncService
 * 
 * Handles background synchronization of ingredient learning data
 * Manages offline/online state and queues sync operations
 * Provides conflict resolution and data integrity checks
 */

import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalDataManager } from '../storage/LocalDataManager';

class DataSyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncQueue = [];
    this.syncInterval = null;
    this.retryAttempts = new Map();
    this.localDataManager = null;
    this.listeners = new Set();
    
    // Configuration
    this.config = {
      syncIntervalMs: 5 * 60 * 1000, // 5 minutes
      maxRetryAttempts: 3,
      retryDelayMs: 30 * 1000, // 30 seconds
      batchSize: 50,
      compressionThreshold: 1000, // bytes
      offlineQueueLimit: 1000
    };
  }

  /**
   * Initialize the sync service
   */
  async initialize(dataManager) {
    this.localDataManager = dataManager;
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
    
    // Set up app state monitoring
    this.setupAppStateMonitoring();
    
    // Load queued sync operations
    await this.loadSyncQueue();
    
    // Start periodic sync if online
    if (this.isOnline) {
      this.startPeriodicSync();
    }
    
    console.log('DataSyncService initialized');
  }

  /**
   * Set up network connectivity monitoring
   */
  setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (!wasOnline && this.isOnline) {
        // Just came online
        console.log('Network connection restored, starting sync');
        this.onConnectionRestored();
      } else if (wasOnline && !this.isOnline) {
        // Just went offline
        console.log('Network connection lost');
        this.onConnectionLost();
      }
      
      this.notifyListeners('networkStateChanged', { isOnline: this.isOnline });
    });
  }

  /**
   * Set up app state monitoring for background sync
   */
  setupAppStateMonitoring() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // App going to background - save sync queue
        this.saveSyncQueue();
      } else if (nextAppState === 'active') {
        // App coming to foreground - trigger sync if needed
        if (this.isOnline && this.syncQueue.length > 0) {
          this.triggerSync();
        }
      }
    });
  }

  /**
   * Add sync operation to queue
   */
  async queueSync(operation) {
    // Check queue size limit
    if (this.syncQueue.length >= this.config.offlineQueueLimit) {
      console.warn('Sync queue full, removing oldest items');
      this.syncQueue = this.syncQueue.slice(-this.config.offlineQueueLimit / 2);
    }

    const syncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      timestamp: Date.now(),
      attempts: 0,
      priority: operation.priority || 'normal'
    };

    // Insert based on priority
    if (syncItem.priority === 'high') {
      this.syncQueue.unshift(syncItem);
    } else {
      this.syncQueue.push(syncItem);
    }

    // Save queue and trigger sync if online
    await this.saveSyncQueue();
    
    if (this.isOnline) {
      this.triggerSync();
    }

    return syncItem.id;
  }

  /**
   * Trigger immediate sync attempt
   */
  async triggerSync() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncStarted');

    try {
      await this.processSyncQueue();
      this.notifyListeners('syncCompleted', { success: true });
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners('syncCompleted', { success: false, error });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process the sync queue
   */
  async processSyncQueue() {
    const batch = this.syncQueue.splice(0, this.config.batchSize);
    const results = { success: 0, failed: 0, errors: [] };

    for (const item of batch) {
      try {
        await this.processSyncItem(item);
        results.success++;
      } catch (error) {
        console.error(`Sync item ${item.id} failed:`, error);
        results.failed++;
        results.errors.push({ id: item.id, error: error.message });
        
        // Handle retry logic
        await this.handleSyncFailure(item, error);
      }
    }

    // Save updated queue
    await this.saveSyncQueue();
    
    console.log('Sync batch processed:', results);
    return results;
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    const { operation } = item;
    
    switch (operation.type) {
      case 'upload_events':
        return await this.uploadEvents(operation.data);
      
      case 'download_config':
        return await this.downloadConfig(operation.data);
      
      case 'sync_metadata':
        return await this.syncMetadata(operation.data);
      
      default:
        throw new Error(`Unknown sync operation: ${operation.type}`);
    }
  }

  /**
   * Upload events to server (mock implementation)
   */
  async uploadEvents(events) {
    // In a real implementation, this would make HTTP requests to your server
    // For now, we'll simulate the upload
    
    console.log(`Uploading ${events.length} events to server`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Server temporarily unavailable');
    }
    
    // Mark events as synced in local storage
    for (const event of events) {
      await this.localDataManager.markEventSynced(event.id);
    }
    
    console.log(`Successfully uploaded ${events.length} events`);
    return { uploaded: events.length, timestamp: Date.now() };
  }

  /**
   * Download configuration from server (mock implementation)
   */
  async downloadConfig(configRequest) {
    console.log('Downloading configuration from server');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    // Mock configuration data
    const config = {
      collection: {
        enabled: true,
        samplingRate: 1.0,
        batchSize: 50
      },
      privacy: {
        dataRetentionDays: 90,
        anonymizeAfterDays: 30,
        allowSharing: false
      },
      features: {
        enhancedTracking: true,
        realTimeSync: false,
        compression: true
      },
      lastUpdated: Date.now()
    };
    
    // Store configuration locally
    await AsyncStorage.setItem('sync_config', JSON.stringify(config));
    
    console.log('Configuration downloaded and stored');
    return config;
  }

  /**
   * Sync metadata with server
   */
  async syncMetadata(metadata) {
    console.log('Syncing metadata with server');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { synced: true, timestamp: Date.now() };
  }

  /**
   * Handle sync failure with retry logic
   */
  async handleSyncFailure(item, error) {
    item.attempts++;
    item.lastError = error.message;
    item.lastAttempt = Date.now();

    if (item.attempts < this.config.maxRetryAttempts) {
      // Calculate exponential backoff delay
      const delay = this.config.retryDelayMs * Math.pow(2, item.attempts - 1);
      item.nextRetry = Date.now() + delay;
      
      // Re-queue for retry
      this.syncQueue.push(item);
      
      console.log(`Sync item ${item.id} will retry in ${delay}ms (attempt ${item.attempts})`);
    } else {
      console.error(`Sync item ${item.id} failed permanently after ${item.attempts} attempts`);
      
      // Move to failed items storage for later analysis
      await this.storeFailed

```javascript
      await this.storeFailedItem(item);
    }
  }

  /**
   * Store failed sync items for later analysis
   */
  async storeFailedItem(item) {
    try {
      const failedItems = await this.getFailedItems();
      failedItems.push({
        ...item,
        failedAt: Date.now()
      });
      
      // Keep only last 100 failed items
      const trimmed = failedItems.slice(-100);
      
      await AsyncStorage.setItem('failed_sync_items', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to store failed sync item:', error);
    }
  }

  /**
   * Get failed sync items
   */
  async getFailedItems() {
    try {
      const stored = await AsyncStorage.getItem('failed_sync_items');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load failed sync items:', error);
      return [];
    }
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.triggerSync();
      }
    }, this.config.syncIntervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Handle connection restored
   */
  async onConnectionRestored() {
    // Load any queued operations
    await this.loadSyncQueue();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Trigger immediate sync if queue has items
    if (this.syncQueue.length > 0) {
      this.triggerSync();
    }
  }

  /**
   * Handle connection lost
   */
  onConnectionLost() {
    // Stop periodic sync
    this.stopPeriodicSync();
    
    // Save current queue
    this.saveSyncQueue();
  }

  /**
   * Save sync queue to local storage
   */
  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load sync queue from local storage
   */
  async loadSyncQueue() {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        
        // Clean up old items (older than 24 hours)
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        this.syncQueue = this.syncQueue.filter(item => item.timestamp > cutoff);
        
        console.log(`Loaded ${this.syncQueue.length} sync operations from storage`);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data = {}) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueSize: this.syncQueue.length,
      lastSync: this.lastSyncTime,
      failedItems: this.getFailedItems().length
    };
  }

  /**
   * Clear all sync data (for testing/debugging)
   */
  async clearSyncData() {
    this.syncQueue = [];
    await AsyncStorage.multiRemove(['sync_queue', 'failed_sync_items', 'sync_config']);
    console.log('Sync data cleared');
  }

  /**
   * Force sync all pending data
   */
  async forceSyncAll() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    // Get all unsynced events from LocalDataManager
    if (this.localDataManager) {
      const unsyncedEvents = await this.localDataManager.getUnsyncedEvents();
      
      if (unsyncedEvents.length > 0) {
        await this.queueSync({
          type: 'upload_events',
          data: unsyncedEvents,
          priority: 'high'
        });
      }
    }

    // Process all queued operations
    await this.triggerSync();
  }

  /**
   * Shutdown the sync service
   */
  shutdown() {
    this.stopPeriodicSync();
    this.saveSyncQueue();
    this.listeners.clear();
    console.log('DataSyncService shutdown');
  }
}

// Export singleton instance
let syncServiceInstance = null;

export function getDataSyncService() {
  if (!syncServiceInstance) {
    syncServiceInstance = new DataSyncService();
  }
  return syncServiceInstance;
}

export default DataSyncService;