# Usability Tests

This document contains questions and scenarios for usability testing to improve the Chef Flow user experience.

## Test Questions

1. **Timer Notification Behavior**: Is it a better experience to have the user tap the stop timer themselves or should the app stop the timer once they click the notification?
   - Option A: User must manually stop the timer after clicking the notification
   - Option B: Timer automatically stops when notification is clicked
   - Considerations: Users might want to acknowledge the notification but continue timing if food needs more time

2. **Background Notification Timing**: Is a 30-second delay for background timer notifications acceptable for cooking use cases?
   - Current behavior: Notifications may be delayed up to 30 seconds when app is in background
   - Option A: Accept the delay as reasonable for cooking
   - Option B: Implement foreground service for exact timing (more battery usage)
   - Considerations: Most cooking timers don't require second-level precision
