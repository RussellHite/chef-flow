# Quick Test Instructions for Cooking Session Management

## 🚀 Quick Start Test (2 minutes)

**Step 1: Open Test Screen**
1. Open the Chef Flow app
2. Navigate to **Admin** tab
3. Tap **"Cooking Session Tests"**

**Step 2: Run Basic Tests**
1. Tap **"Run All Tests"** button
2. Verify that basic tests pass:
   - ✅ **1.1 ContextCreation**: Should pass
   - ✅ **1.2 StateStructure**: Should pass  
   - ✅ **1.3 DispatchActions**: Should pass
   - ⚠️ **2.1 StorageDuringSession**: May be skipped (no active session)
   - ⚠️ **2.2 SessionValidation**: May be skipped (no active session)
   - ✅ **3.1 ProgrammaticNavigation**: Should pass
   - ✅ **3.2 StepProgress**: Should pass
   - ✅ **4.1 TimerState**: Should pass
   - ✅ **4.2 TimerOperations**: Should pass
   - ⚠️ **5.1 SingleSessionConstraint**: May be skipped (no active session)
   - ✅ **5.2 MemoryUsage**: Should pass

## 🧪 Full Test (5 minutes)

**Step 3: Test Session Functionality**
1. Tap **"Start Session"** button
2. Verify session shows as active in status card
3. Tap **"Run All Tests"** again
4. Now all tests should pass ✅

**Step 4: Test Manual Controls**
1. Tap **"Test Navigation"** - should move to step 2
2. Tap **"Start Timer"** - should start 30-second countdown
3. Observe timer counting down in status card
4. Tap **"End Session"** - should complete session

## ✅ Expected Results

### Basic Infrastructure Tests (Always Pass):
- **Context Creation**: Context API setup working
- **State Structure**: All required fields present
- **Dispatch Actions**: All action types available
- **Navigation Methods**: Step navigation functions available
- **Progress Calculation**: Progress percentage working
- **Timer State**: Timer state structure correct
- **Timer Operations**: Timer control methods available
- **Memory Usage**: State size reasonable (< 10KB)

### Session-Dependent Tests (Pass with Active Session):
- **Storage During Session**: Session data persisted to AsyncStorage
- **Session Validation**: Stored data passes validation
- **Single Session Constraint**: Cannot start multiple sessions

## 🔧 If Tests Fail

**Common Issues:**
1. **"Context not available"** → Check if CookingProvider is in App.js
2. **"Missing required field"** → Check CookingContext state structure
3. **"Missing action"** → Check COOKING_ACTIONS export
4. **"Session not stored"** → Start a session first, then test

**Debug Steps:**
1. Check **Current Session Status** card for live data
2. Use **"Clear All Data"** to reset state
3. Check console logs for detailed error messages
4. Try **"Start Session"** before running tests

## 🎯 Success Criteria

✅ **All basic infrastructure tests pass**
✅ **Can start and end cooking sessions**  
✅ **Session state persists and displays correctly**
✅ **Timer functionality works**
✅ **Navigation between steps works**
✅ **No crashes or major errors**

## 🚦 Integration Test

**Test the full cooking flow:**
1. Go to **Recipes** tab
2. Select any recipe → **Cook**
3. Tap **"Let's Cook!"**
4. Verify cooking screen opens
5. Navigate through steps
6. Verify session persists

**Expected:** Smooth transition from recipe selection to cooking interface with persistent session state.

---

**Status**: ✅ **IMPLEMENTATION COMPLETE**
**Issue**: [#6 - Global Cooking Session Management](https://github.com/RussellHite/chef-flow/issues/6)