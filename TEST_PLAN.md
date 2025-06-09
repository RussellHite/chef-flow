# Cooking Session Management Test Plan
## GitHub Issue #6 - Comprehensive Testing Guide

This document provides step-by-step instructions to test the Global Cooking Session Management & Context implementation according to the requirements in GitHub Issue #6.

## Setup Requirements

1. **Expo Development Server**: Ensure `npm start` is running
2. **Device/Simulator**: iOS/Android device or simulator connected
3. **Test Data**: The app includes sample test data for thorough testing

## Test Categories

### 1. Context API and State Management Tests ✅

#### Test 1.1: Context Creation
**Objective**: Verify CookingContext is properly created and accessible

**Steps**:
1. Open the app
2. Navigate to **Admin** → **Cooking Session Tests**
3. Tap **"Run All Tests"** 
4. Verify **"1.1 ContextCreation"** shows ✅ **Passed**

**Expected Result**: Context with cookingState and dispatch should be available

#### Test 1.2: State Structure Validation  
**Objective**: Ensure all required state fields are present

**Expected Fields**:
- `sessionId` - Unique session identifier
- `isActiveCookingSession` - Boolean session status
- `activeRecipe` - Current recipe being cooked
- `recipeName` - Display name of recipe
- `totalSteps` - Total number of cooking steps
- `currentStep` - Current step index
- `timer` - Timer state object

**Verification**: Check that **"1.2 StateStructure"** test passes

#### Test 1.3: Dispatch Actions
**Objective**: Verify all cooking actions are available

**Required Actions**:
- `START_COOKING` - Begin cooking session
- `END_COOKING` - Complete cooking session  
- `UPDATE_STEP` - Navigate between steps
- `START_TIMER` - Start step timer
- `UPDATE_TIMER` - Update timer countdown
- `STOP_TIMER` - Stop active timer

**Verification**: Check that **"1.3 DispatchActions"** test passes

### 2. Persistence Layer Tests ✅

#### Test 2.1: Storage During Session
**Objective**: Verify session data is saved to AsyncStorage

**Steps**:
1. In **Cooking Session Tests**, tap **"Start Session"**
2. Verify session is active in the status card
3. Tap **"Run All Tests"**
4. Check **"2.1 StorageDuringSession"** passes
5. Observe storage data appears at bottom of screen

**Expected Result**: Session data should be stored and visible in JSON format

#### Test 2.2: Session Validation
**Objective**: Ensure stored session data is valid

**Validation Checks**:
- Required fields present
- Data types correct
- Step indices within bounds
- Timestamps valid

**Verification**: Check that **"2.2 SessionValidation"** test passes

#### Test 2.3: Session Restoration (Manual Test)
**Objective**: Verify sessions restore after app restart

**Steps**:
1. Start a cooking session
2. Navigate to step 2 or 3
3. Close the app completely
4. Restart the app  
5. Check if session is restored

**Expected Result**: Session should restore with correct step and progress

### 3. Navigation Integration Tests ✅

#### Test 3.1: Programmatic Navigation
**Objective**: Verify step navigation methods work correctly

**Steps**:
1. Start a cooking session
2. Use **"Test Navigation"** button
3. Verify step number increases
4. Check **"3.1 ProgrammaticNavigation"** test passes

**Navigation Methods to Test**:
- `goToStep(stepNumber)` - Jump to specific step
- `nextStep()` - Move to next step
- `previousStep()` - Move to previous step

#### Test 3.2: Progress Calculation
**Objective**: Ensure progress percentage is calculated correctly

**Formula**: `(currentStep + 1) / totalSteps * 100`

**Steps**:
1. Start session and note total steps
2. Navigate through steps
3. Verify progress percentage updates correctly
4. Check **"3.2 StepProgress"** test passes

#### Test 3.3: Navigation Boundaries (Manual Test)
**Objective**: Test navigation edge cases

**Steps**:
1. Start cooking session  
2. Try to go to previous step on first step (should be disabled)
3. Navigate to last step
4. Try to go to next step (should complete session)

**Expected Results**:
- Previous button disabled on first step
- Next button shows "Finish" on last step
- Session ends when completing final step

### 4. Timer System Tests ✅

#### Test 4.1: Timer State Management
**Objective**: Verify timer state is properly managed

**Timer State Fields**:
- `isActive` - Timer running status
- `isPaused` - Timer pause status  
- `remainingTime` - Seconds remaining
- `duration` - Original timer duration
- `stepId` - Associated step
- `expiresAt` - Expiration timestamp

**Steps**:
1. Check **"4.1 TimerState"** test passes
2. Start a timer using **"Start Timer"** button
3. Verify timer shows in status card

#### Test 4.2: Timer Operations
**Objective**: Test all timer control methods

**Timer Methods**:
- `startStepTimer(duration)` - Start new timer
- `stopStepTimer()` - Stop active timer
- `toggleTimer()` - Pause/resume timer

**Steps**:
1. Start cooking session
2. Use **"Start Timer"** (30 second timer)
3. Observe countdown in status card
4. Test pause/resume functionality
5. Check **"4.2 TimerOperations"** test passes

#### Test 4.3: Timer Persistence (Manual Test)
**Objective**: Verify timers work across navigation

**Steps**:
1. Start cooking session
2. Start a timer
3. Navigate to different screens
4. Return to cooking session
5. Verify timer is still running

#### Test 4.4: Timer Background Operation (Manual Test)
**Objective**: Test timer continues when app is backgrounded

**Steps**:
1. Start cooking session with timer
2. Background the app for 10+ seconds
3. Return to app
4. Verify timer continued counting down

### 5. Performance and Compatibility Tests ✅

#### Test 5.1: Single Session Constraint
**Objective**: Ensure only one cooking session can be active

**Steps**:
1. Start a cooking session
2. Try to start another session (should fail)
3. Check **"5.1 SingleSessionConstraint"** test passes

**Expected Result**: Second session start should be rejected

#### Test 5.2: Memory Usage
**Objective**: Verify state size is reasonable

**Steps**:
1. Start cooking session
2. Navigate through multiple steps
3. Check **"5.2 MemoryUsage"** test passes
4. Verify state size < 10KB

#### Test 5.3: Performance Impact (Manual Test)
**Objective**: Ensure cooking context doesn't impact other screens

**Steps**:
1. Navigate to non-cooking screens (Recipes, Admin, Profile)
2. Verify smooth navigation and responsiveness
3. Check memory usage remains stable

### 6. Integration Tests ✅

#### Test 6.1: Recipe Screen Integration
**Objective**: Test "Cook" button functionality

**Steps**:
1. Go to **Recipes** tab
2. Select any recipe
3. Tap **"Cook"** button
4. Verify navigation to CookRecipe screen
5. Tap **"Let's Cook!"**
6. Verify cooking session starts

#### Test 6.2: Active Session Handling
**Objective**: Test behavior with existing active session

**Steps**:
1. Start cooking one recipe
2. Navigate back to Recipes
3. Try to cook a different recipe
4. Verify conflict dialog appears
5. Test each dialog option:
   - **Cancel** (stays on current screen)
   - **End & Start New** (ends current, starts new)
   - **Continue Current** (resumes existing session)

#### Test 6.3: Session Recovery Banner
**Objective**: Verify active session banner appears

**Steps**:
1. Start cooking session
2. Navigate to Recipes
3. Select same recipe being cooked
4. Verify active session banner shows
5. Tap **"Resume Cooking"** button

### 7. End-to-End Workflow Tests ✅

#### Test 7.1: Complete Cooking Flow
**Objective**: Test full cooking session lifecycle

**Steps**:
1. Start from Recipes screen
2. Select recipe and tap "Cook"
3. Review ingredients on CookRecipe screen
4. Tap "Let's Cook!" to start session
5. Navigate through all steps
6. Start/stop timers on timed steps
7. Complete final step
8. Verify session ends and returns to home

**Expected Results**:
- Session persists throughout navigation
- Timers work correctly
- Progress updates accurately
- Session completes successfully

#### Test 7.2: Session Interruption Recovery
**Objective**: Test recovery from app interruption

**Steps**:
1. Start cooking session (step 2-3)
2. Start a timer
3. Force close app
4. Restart app
5. Navigate to cooking screen
6. Verify session and progress restored

### 8. Error Handling Tests ✅

#### Test 8.1: Invalid Session Data
**Objective**: Test handling of corrupted session data

**Steps**:
1. Use **"Clear All Data"** button to reset
2. Manually corrupt AsyncStorage data (advanced)
3. Restart app
4. Verify graceful handling

#### Test 8.2: Missing Recipe Data
**Objective**: Test behavior with incomplete recipe data

**Steps**:
1. Start session with recipe missing steps
2. Verify error handling
3. Check no crashes occur

### 9. Automated Test Execution ✅

#### Running All Tests
**Steps**:
1. Navigate to **Admin** → **Cooking Session Tests**
2. Tap **"Run All Tests"** button
3. Review all test results
4. Verify majority of tests pass ✅

#### Expected Test Results:
- ✅ **1.1_ContextCreation**: Passed
- ✅ **1.2_StateStructure**: Passed  
- ✅ **1.3_DispatchActions**: Passed
- ✅ **2.1_StorageDuringSession**: Passed (when session active)
- ✅ **2.2_SessionValidation**: Passed
- ✅ **3.1_ProgrammaticNavigation**: Passed
- ✅ **3.2_StepProgress**: Passed
- ✅ **4.1_TimerState**: Passed
- ✅ **4.2_TimerOperations**: Passed
- ✅ **5.1_SingleSessionConstraint**: Passed
- ✅ **5.2_MemoryUsage**: Passed

## Test Data Management

### Clear Test Data
Use **"Clear All Data"** button to:
- Reset cooking sessions
- Clear session history
- Remove persisted state

### Demo Data
The test suite includes a sample recipe with 5 steps for consistent testing.

## Troubleshooting

### Common Issues:
1. **Tests fail initially**: Start a cooking session first
2. **Storage tests fail**: Ensure session is active
3. **Timer tests fail**: Start a timer before running tests
4. **Navigation issues**: Check React Navigation setup

### Debug Information:
- Check **Current Session Status** card for live session data
- Review **Storage Data** section for persisted state
- Use **Console Logs** for detailed debugging

## Success Criteria

✅ **All automated tests pass**  
✅ **Session persists across navigation**  
✅ **Session survives app backgrounding**  
✅ **Timer continues in background**  
✅ **Proper session cleanup on completion**  
✅ **Single session constraint enforced**  
✅ **State restoration after app restart**  
✅ **Integration with existing cooking flow**  

## Reporting Issues

If any tests fail or unexpected behavior occurs:

1. **Document the failing test**
2. **Note device/simulator used**  
3. **Include session status and storage data**
4. **Provide reproduction steps**
5. **Report via GitHub Issues**

---

## Quick Test Checklist

- [ ] Run automated test suite
- [ ] Test complete cooking workflow  
- [ ] Verify session persistence
- [ ] Test timer functionality
- [ ] Check navigation integration
- [ ] Verify conflict resolution
- [ ] Test app restart recovery
- [ ] Validate performance impact

**Implementation Status**: ✅ **COMPLETE**
**GitHub Issue**: [#6 - Global Cooking Session Management](https://github.com/RussellHite/chef-flow/issues/6)