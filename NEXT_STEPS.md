# Next Steps - Pre-Merge Testing Checklist

## Core Functionality
- [ ] **Recipe Creation**: Add a new recipe and verify parsing works correctly
- [ ] **Recipe Editing**: Edit existing recipes (simplified single view)
- [ ] **Ingredient Parsing**: Test complex ingredients (e.g., "2 (5 ounce) cans", "divided" ingredients)
- [ ] **Step Navigation**: Navigate forward/backward through cooking steps
- [ ] **Session Persistence**: Start cooking, close app, reopen and verify session resumes

## Timer Features
- [ ] **Multiple Timers**: Set multiple timers in different steps
- [ ] **Timer Adjustment**: Use +/- buttons to adjust timer values
- [ ] **Concurrent Timers**: Run multiple timers simultaneously
- [ ] **Timer Overflow**: Let timers go negative and verify display
- [ ] **Timer Cancellation**: Stop/reset timers mid-countdown

## Notification Testing
- [ ] **Foreground Notifications**: Verify notifications appear when app is open
- [ ] **Background Notifications**: Test with app minimized (dev build only)
- [ ] **Notification Tap Navigation**: Tap notifications from different app states
- [ ] **Multiple Notifications**: Set multiple timers and handle multiple notifications
- [ ] **Notification Permissions**: Deny then re-enable permissions

## Edge Cases
- [ ] **No Internet**: Test app functionality offline
- [ ] **Low Memory**: Test with many apps open
- [ ] **Screen Rotation**: Rotate device during cooking (if orientation unlocked)
- [ ] **Interruptions**: Phone calls during active timers
- [ ] **App Termination**: Force close app with active session

## Data Integrity
- [ ] **Recipe Storage**: Verify recipes persist after app restart
- [ ] **Cooking History**: Check completed sessions are saved
- [ ] **Ingredient Database**: Verify admin panel shows ingredient data
- [ ] **Migration**: Test with old recipe data (if applicable)

## Performance
- [ ] **Large Recipes**: Test with recipes having 20+ steps
- [ ] **Fast Navigation**: Rapidly switch between screens
- [ ] **Memory Leaks**: Use app for extended period
- [ ] **Battery Usage**: Monitor battery drain during cooking session

## After Testing
1. Fix any bugs discovered during testing
2. Update documentation if needed
3. Merge feature branch to main
4. Create production build with `eas build --platform android --profile production`
5. Test production build before release