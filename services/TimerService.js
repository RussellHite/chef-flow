import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

class TimerService {
  constructor() {
    this.activeTimers = new Map();
    this.listeners = new Set();
    this.intervalId = null;
    this.loadTimersFromStorage();
  }

  async loadTimersFromStorage() {
    try {
      const savedTimers = await AsyncStorage.getItem('activeTimers');
      if (savedTimers) {
        const timersData = JSON.parse(savedTimers);
        const now = Date.now();
        
        console.log('Loading timers from storage:', Object.keys(timersData).length);
        
        for (const [id, timerData] of Object.entries(timersData)) {
          const elapsedTime = now - timerData.startTime;
          const remainingTime = timerData.duration - elapsedTime;
          
          console.log(`Loading timer ${id}: elapsed=${elapsedTime}ms, remaining=${remainingTime}ms`);
          
          this.activeTimers.set(id, {
            ...timerData,
            remainingTime,
            isRunning: timerData.isRunning && remainingTime > 0,
            isOverflow: remainingTime <= 0
          });
        }
        
        this.notifyListeners();
        if (this.activeTimers.size > 0) {
          this.startMainInterval();
        }
      }
    } catch (error) {
      console.error('Error loading timers from storage:', error);
    }
  }

  async saveTimersToStorage() {
    try {
      const timersData = {};
      for (const [id, timer] of this.activeTimers.entries()) {
        timersData[id] = timer;
      }
      await AsyncStorage.setItem('activeTimers', JSON.stringify(timersData));
    } catch (error) {
      console.error('Error saving timers to storage:', error);
    }
  }

  async startTimer(id, minutes, name = '', recipeData = null) {
    console.log(`TimerService.startTimer called with: id=${id}, minutes=${minutes}, name=${name}`);
    
    if (!minutes || minutes <= 0) {
      console.error('Invalid timer duration:', minutes);
      return null;
    }
    
    const duration = minutes * 60 * 1000; // Convert to milliseconds
    const startTime = Date.now();
    
    const timer = {
      id,
      name,
      duration,
      remainingTime: duration,
      startTime,
      isRunning: true,
      isOverflow: false,
      recipeData
    };
    
    console.log('Creating timer:', { id, duration, remainingTime: duration });
    
    this.activeTimers.set(id, timer);
    this.saveTimersToStorage();
    this.notifyListeners();
    
    // Schedule notification
    await NotificationService.scheduleTimerNotification(id, name, minutes, recipeData);
    
    if (!this.intervalId) {
      this.startMainInterval();
    }
    
    return timer;
  }

  async pauseTimer(id) {
    const timer = this.activeTimers.get(id);
    if (timer && timer.isRunning) {
      timer.isRunning = false;
      this.saveTimersToStorage();
      this.notifyListeners();
      
      // Cancel scheduled notification
      await NotificationService.cancelTimerNotification(id);
    }
  }

  async resumeTimer(id) {
    const timer = this.activeTimers.get(id);
    if (timer && !timer.isRunning) {
      timer.startTime = Date.now() - (timer.duration - timer.remainingTime);
      timer.isRunning = true;
      this.saveTimersToStorage();
      this.notifyListeners();
      
      // Reschedule notification with remaining time
      const remainingMinutes = Math.ceil(timer.remainingTime / 60000);
      await NotificationService.scheduleTimerNotification(id, timer.name, remainingMinutes, timer.recipeData);
      
      if (!this.intervalId) {
        this.startMainInterval();
      }
    }
  }

  resetTimer(id) {
    const timer = this.activeTimers.get(id);
    if (timer) {
      timer.remainingTime = timer.duration;
      timer.startTime = Date.now();
      timer.isRunning = false;
      timer.isOverflow = false;
      this.saveTimersToStorage();
      this.notifyListeners();
    }
  }

  async stopTimer(id) {
    this.activeTimers.delete(id);
    this.saveTimersToStorage();
    this.notifyListeners();
    
    // Cancel any scheduled notification
    await NotificationService.cancelTimerNotification(id);
    
    if (this.activeTimers.size === 0 && this.intervalId) {
      this.stopMainInterval();
    }
  }

  startMainInterval() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      let hasActiveTimers = false;
      let shouldNotify = false;
      
      for (const [id, timer] of this.activeTimers.entries()) {
        if (timer.isRunning) {
          hasActiveTimers = true;
          const elapsedTime = Date.now() - timer.startTime;
          const newRemainingTime = timer.duration - elapsedTime;
          
          if (newRemainingTime <= 0 && !timer.isOverflow) {
            timer.isOverflow = true;
            timer.remainingTime = newRemainingTime;
            shouldNotify = true;
            console.log(`Timer ${id} completed - overflow triggered`);
          } else {
            timer.remainingTime = newRemainingTime;
          }
        }
      }
      
      if (shouldNotify) {
        this.saveTimersToStorage();
      }
      
      this.notifyListeners();
      
      if (!hasActiveTimers) {
        this.stopMainInterval();
      }
    }, 1000);
  }

  stopMainInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getTimer(id) {
    return this.activeTimers.get(id);
  }

  getAllTimers() {
    return Array.from(this.activeTimers.values());
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    for (const callback of this.listeners) {
      callback(Array.from(this.activeTimers.values()));
    }
  }

  formatTime(milliseconds) {
    const isNegative = milliseconds < 0;
    const absMilliseconds = Math.abs(milliseconds);
    
    const totalSeconds = Math.floor(absMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return isNegative ? `-${formattedTime}` : formattedTime;
  }

  async clearAllTimers() {
    console.log('Clearing all timers');
    this.stopMainInterval();
    this.activeTimers.clear();
    await AsyncStorage.removeItem('activeTimers');
    this.notifyListeners();
  }

  cleanup() {
    this.stopMainInterval();
    this.listeners.clear();
    this.activeTimers.clear();
  }
}

export default new TimerService();