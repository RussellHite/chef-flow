# Chef Flow APK Build Setup Guide

## 🎯 Ready for APK Building!

Your Chef Flow app is now configured for EAS Build! Follow these steps to create your first APK.

## 📋 Pre-Build Checklist

### ✅ Completed Setup
- [x] EAS configuration file (`eas.json`) created
- [x] Android build settings added to `app.json`
- [x] Build scripts added to `package.json`
- [x] EAS CLI installed locally
- [x] App assets are in place

### 🔧 Required Next Steps

#### 1. Login to Expo Account
```bash
npx eas login
# Enter your Expo account credentials
# If you don't have an account, create one at https://expo.dev
```

#### 2. Initialize EAS Project
```bash
npx eas build:configure
# This will:
# - Create or update your EAS project
# - Set the project ID in app.json
# - Link your local project to EAS
```

#### 3. Build Your First APK
```bash
# For testing (recommended first build)
npm run build:android:preview

# Alternative: Direct EAS command
npx eas build --platform android --profile preview
```

#### 4. Monitor Build Progress
```bash
# Check build status
npm run build:status

# Or visit: https://expo.dev/accounts/[your-username]/projects/chef-flow/builds
```

## 📱 Build Profiles Explained

### Preview Profile (Recommended for Testing)
- **Use case**: Testing and distribution to team members
- **Output**: APK file
- **Size**: Smaller, faster to build
- **Installation**: Enable "Unknown Sources" on Android device

### Development Profile
- **Use case**: Development with custom native code
- **Output**: Development build APK
- **Features**: Debugging enabled, development tools included

### Production Profile
- **Use case**: Google Play Store submission
- **Output**: AAB (Android App Bundle)
- **Optimization**: Fully optimized for distribution

## 🔍 Current Configuration

### App Details
- **Name**: Chef Flow
- **Package**: com.russellhite.chefflow
- **Version**: 1.0.0 (versionCode: 1)

### Android Settings
- **Target SDK**: 34 (Android 14)
- **Permissions**: Internet, Network State, Vibrate
- **Build Type**: APK for preview, AAB for production

### Assets
- App Icon: `./assets/icon.png`
- Adaptive Icon: `./assets/adaptive-icon.png`
- Splash Screen: `./assets/splash-icon.png`

## 🚀 Build Commands

```bash
# Preview APK (for testing)
npm run build:android:preview

# Development APK
npm run build:android:dev

# Production AAB (for Play Store)
npm run build:android:prod

# Check build status
npm run build:status
```

## 📊 Expected Build Process

1. **Upload**: Code and assets uploaded to EAS servers
2. **Dependencies**: All npm packages installed
3. **Native Build**: Android project compiled
4. **Optimization**: Code minification and asset optimization
5. **Signing**: APK/AAB signed for distribution
6. **Download**: Build artifact ready for download

### Build Times
- **Preview APK**: ~5-10 minutes
- **Development APK**: ~8-15 minutes
- **Production AAB**: ~10-20 minutes

## 📱 Installing Your APK

### On Android Device
1. Download APK from EAS build dashboard
2. Enable "Install unknown apps" for your browser/file manager
3. Tap the APK file to install
4. Grant permissions when prompted

### Via ADB (Advanced)
```bash
adb install path/to/your-app.apk
```

## 🔧 Troubleshooting

### Build Failures
```bash
# Clear Metro cache
npx expo start --clear

# Clean prebuild
npm run prebuild

# Update dependencies
npm update
```

### Common Issues
- **Authentication Error**: Run `npx eas login` first
- **Project Not Found**: Run `npx eas build:configure`
- **Build Timeout**: Check for large assets or dependencies
- **Installation Failed**: Enable "Unknown Sources" on Android

### Asset Issues
If you need to update app icons:
```bash
# Verify assets exist
ls -la assets/

# Required files:
# - icon.png (1024x1024)
# - adaptive-icon.png (1024x1024)
# - splash-icon.png (any resolution)
```

## 📈 Build Success Metrics

### ✅ Success Indicators
- Build completes without errors
- APK size < 50MB for basic app
- Installs successfully on Android device
- App launches without crashes
- All features work as expected

### 🎯 Next Steps After First Build
1. Test thoroughly on multiple Android devices
2. Share APK with team members for feedback
3. Iterate based on testing results
4. Consider setting up automated builds

## 🔗 Useful Links

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Dashboard](https://expo.dev/)
- [Android App Signing](https://docs.expo.dev/app-signing/android-credentials/)

---

## 💡 Pro Tips

1. **Start with Preview**: Always test with preview profile first
2. **Monitor Builds**: Keep an eye on build logs for warnings
3. **Test Offline**: Ensure your app works without internet
4. **Version Control**: Commit your configuration changes
5. **Asset Optimization**: Keep assets small for faster builds

Ready to build your APK? Start with step 1 above! 🚀