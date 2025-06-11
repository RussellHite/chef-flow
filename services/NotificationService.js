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
    shouldSetBadge: false,
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
    
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

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
      console.log('Notification received:', notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response.notification.request.content.data);
      const { timerId, recipeId, stepIndex } = response.notification.request.content.data;
      
      // Handle deep linking to the cooking screen
      if (timerId && recipeId) {
        this.handleTimerNotificationTap(timerId, recipeId, stepIndex);
      }
    });

    return true;
  }

  async scheduleTimerNotification(timerId, timerName, minutes, recipeData = null) {
    // Ensure we have a valid time in seconds
    const seconds = Math.max(1, Math.round(minutes * 60));
    
    console.log(`Scheduling notification for ${timerName} in ${seconds} seconds (${minutes} minutes)`);
    
    // For Expo notifications, we need to use a date trigger for proper scheduling
    const trigger = new Date(Date.now() + (seconds * 1000));
    
    console.log('Notification will trigger at:', trigger.toLocaleTimeString());

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Complete!',
        body: timerName || `Your ${minutes} minute timer is done`,
        sound: true,
        data: { 
          timerId,
          recipeId: recipeData?.recipeId,
          stepIndex: recipeData?.stepIndex,
        },
      },
      trigger,
    });

    // Store notification ID for cancellation
    await this.storeNotificationId(timerId, notificationId);
    
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
    // console.log('Timer notification tapped:', { timerId, recipeId, stepIndex });
    
    try {
      // Check if there's an active cooking session first
      const activeCookingSession = await AsyncStorage.getItem('activeCookingSession');
      
      if (activeCookingSession) {
        // Navigate to the active cooking session
        const sessionData = JSON.parse(activeCookingSession);
        // console.log('Navigating to active cooking session:', sessionData);
        
        // Navigate to cooking flow with resume flag
        NavigationService.navigate('Recipes', {
          screen: 'CookingFlow',
          params: { 
            resumeSession: true,
            recipeTitle: sessionData.recipeName
          }
        });
      } else if (recipeId) {
        // Fallback: navigate to specific recipe if no active session
        const storedRecipes = await AsyncStorage.getItem('recipes');
        if (storedRecipes) {
          const recipes = JSON.parse(storedRecipes);
          const recipe = recipes.find(r => r.id === recipeId);
          
          if (recipe) {
            NavigationService.navigateToCookingFlow(recipe, stepIndex || 0);
          }
        }
      } else {
        // Last resort: navigate to recipes screen
        NavigationService.navigate('Recipes');
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
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