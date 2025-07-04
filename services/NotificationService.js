import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as NavigationService from './NavigationService';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Check if running in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('Running in Expo Go - Timer notifications will work but background persistence is limited');
      }
    } catch (error) {
      console.log('Constants not available in this environment');
    }
    
    // Clear all pending notifications on startup
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cleared all pending notifications');
    
    // Request permissions with more explicit options
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          priority: 'max',
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }
    
    console.log('✅ Notification permissions granted');

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer-channel', {
        name: 'Timer Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
      });
    }

    // Set up notification listeners
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received (app in foreground):', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data
      });
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 ANY notification response received:', {
        actionIdentifier: response.actionIdentifier,
        userText: response.userText,
        notification: {
          title: response.notification.request.content.title,
          body: response.notification.request.content.body,
          data: response.notification.request.content.data
        }
      });
      
      const { timerId, recipeId, stepIndex } = response.notification.request.content.data || {};
      
      // Handle deep linking to the cooking screen
      if (timerId || recipeId) {
        console.log('🚀 Processing timer notification with data:', { timerId, recipeId, stepIndex });
        this.handleTimerNotificationTap(timerId, recipeId, stepIndex);
      } else {
        console.log('⚠️ Notification missing timer/recipe data:', { timerId, recipeId, stepIndex });
      }
    });

    return true;
  }

  async sendImmediateNotification(title, body, data = {}) {
    try {
      console.log('🔔 Sending immediate notification:', { title, body, data });
      
      const content = {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data,
      };
      
      // Add Android-specific channel
      if (Platform.OS === 'android') {
        content.channelId = 'timer-channel';
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // null trigger = immediate notification
      });
      
      console.log('✅ Immediate notification sent, ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending immediate notification:', error);
      return null;
    }
  }

  async scheduleTimerNotification(timerId, timerName, minutes, recipeData = null) {
    // Ensure we have a valid time in seconds
    const seconds = Math.max(1, Math.round(minutes * 60));
    
    console.log(`Scheduling notification for ${timerName} in ${seconds} seconds (${minutes} minutes)`);
    console.log('🔍 Notification data will include:', { 
      timerId,
      recipeId: recipeData?.recipeId,
      stepIndex: recipeData?.stepIndex,
      fullRecipeData: recipeData
    });
    
    // Use the modern trigger format to avoid deprecation warning
    const triggerDate = new Date(Date.now() + (seconds * 1000));
    const trigger = {
      type: 'date',
      date: triggerDate,
    };
    
    console.log('Notification will trigger at:', triggerDate.toLocaleTimeString());

    const content = {
      title: 'Timer Complete!',
      body: timerName || `Your ${minutes} minute timer is done`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { 
        timerId,
        recipeId: recipeData?.recipeId,
        stepIndex: recipeData?.stepIndex,
      },
    };
    
    // Add Android-specific channel
    if (Platform.OS === 'android') {
      content.channelId = 'timer-channel';
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });

    // Store notification ID for cancellation
    await this.storeNotificationId(timerId, notificationId);
    
    console.log('✅ Notification scheduled successfully, ID:', notificationId);
    
    // Debug: Check how many notifications are now scheduled
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📅 Total scheduled notifications: ${scheduled.length}`);
    
    return notificationId;
  }

  async cancelTimerNotification(timerId) {
    const notificationId = await this.getNotificationId(timerId);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeNotificationId(timerId);
    }
  }

  async storeNotificationId(timerId, notificationId) {
    try {
      const stored = await AsyncStorage.getItem('timerNotifications');
      const notifications = stored ? JSON.parse(stored) : {};
      notifications[timerId] = notificationId;
      await AsyncStorage.setItem('timerNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification ID:', error);
    }
  }

  async getNotificationId(timerId) {
    try {
      const stored = await AsyncStorage.getItem('timerNotifications');
      const notifications = stored ? JSON.parse(stored) : {};
      return notifications[timerId];
    } catch (error) {
      console.error('Error getting notification ID:', error);
      return null;
    }
  }

  async removeNotificationId(timerId) {
    try {
      const stored = await AsyncStorage.getItem('timerNotifications');
      const notifications = stored ? JSON.parse(stored) : {};
      delete notifications[timerId];
      await AsyncStorage.setItem('timerNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error removing notification ID:', error);
    }
  }

  async handleTimerNotificationTap(timerId, recipeId, stepIndex) {
    console.log('🚀 Handling timer notification tap:', { timerId, recipeId, stepIndex });
    
    try {
      // Check if there's an active cooking session first
      const activeCookingSession = await AsyncStorage.getItem('chef-flow-cooking-session');
      console.log('🔍 Checking for active cooking session:', activeCookingSession ? 'Found' : 'Not found');
      
      if (activeCookingSession) {
        // Navigate to the active cooking session
        const sessionData = JSON.parse(activeCookingSession);
        console.log('✅ Found active cooking session, navigating...', {
          recipeName: sessionData.recipeName,
          isActive: sessionData.isActiveCookingSession,
          currentStep: sessionData.currentStep
        });
        
        // Try to get the full recipe from storage
        let fullRecipe = null;
        try {
          const savedRecipe = await AsyncStorage.getItem('chef-flow-active-recipe');
          if (savedRecipe) {
            fullRecipe = JSON.parse(savedRecipe);
            console.log('📖 Retrieved full recipe from storage');
          }
        } catch (recipeError) {
          console.warn('Failed to retrieve full recipe:', recipeError);
        }
        
        // Navigate to cooking flow with recipe and step info
        NavigationService.navigate('Recipes', {
          screen: 'CookingFlow',
          params: { 
            resumeSession: true,
            recipe: fullRecipe,
            recipeId: recipeId || sessionData.activeRecipe,
            initialStepIndex: stepIndex !== undefined ? stepIndex : sessionData.currentStep,
            resumeFromNotification: true
          }
        });
        console.log('📱 Navigation dispatched to CookingFlow with step:', stepIndex !== undefined ? stepIndex : sessionData.currentStep);
      } else if (recipeId) {
        console.log('⚠️ No active session found, but we have recipeId:', recipeId);
        console.log('🔄 Attempting navigation to CookingFlow with recipe ID and step:', stepIndex);
        
        // Try to get the recipe from storage even without active session
        let fullRecipe = null;
        try {
          const savedRecipe = await AsyncStorage.getItem('chef-flow-active-recipe');
          if (savedRecipe) {
            fullRecipe = JSON.parse(savedRecipe);
            if (fullRecipe.id === recipeId) {
              console.log('📖 Found matching recipe in storage');
            } else {
              fullRecipe = null;
            }
          }
        } catch (recipeError) {
          console.warn('Failed to retrieve recipe:', recipeError);
        }
        
        NavigationService.navigate('Recipes', {
          screen: 'CookingFlow',
          params: { 
            recipe: fullRecipe,
            recipeId: recipeId,
            initialStepIndex: stepIndex || 0,
            resumeFromNotification: true
          }
        });
        console.log('📱 Navigation dispatched to CookingFlow with recipe ID');
      } else {
        console.log('🏠 No recipe data, navigating to recipes screen');
        // Last resort: navigate to recipes screen
        NavigationService.navigate('Recipes');
      }
    } catch (error) {
      console.error('❌ Error navigating from notification:', error);
      // Fallback to recipes screen
      NavigationService.navigate('Recipes');
    }
  }

  async debugScheduledNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduled.length);
    scheduled.forEach(notif => {
      console.log('- Notification:', {
        id: notif.identifier,
        title: notif.content.title,
        body: notif.content.body,
        trigger: notif.trigger
      });
    });
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Background tasks are not supported in Expo Go
// This would be enabled in a development build
if (!__DEV__) {
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Background task error:', error);
      return;
    }

    try {
      // Update timer states in the background
      const timers = await AsyncStorage.getItem('activeTimers');
      if (timers) {
        const timerData = JSON.parse(timers);
        const now = Date.now();
        
        for (const [id, timer] of Object.entries(timerData)) {
          if (timer.isRunning) {
            const elapsedTime = now - timer.startTime;
            const remainingTime = timer.duration - elapsedTime;
            
            // Check if timer just completed
            if (remainingTime <= 0 && !timer.isOverflow) {
              timer.isOverflow = true;
              timer.remainingTime = remainingTime;
              
              // Send notification
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Timer Complete!',
                  body: timer.name || 'Your timer is done',
                  sound: true,
                  data: { timerId: id },
                },
                trigger: null, // Immediate
              });
            } else {
              timer.remainingTime = remainingTime;
            }
          }
        }
        
        await AsyncStorage.setItem('activeTimers', JSON.stringify(timerData));
      }
    } catch (error) {
      console.error('Background task processing error:', error);
    }
  });
}

export default new NotificationService();