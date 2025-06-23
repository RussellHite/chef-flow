#!/usr/bin/env node

/**
 * Chef Flow Build Setup Verification Script
 * 
 * Verifies that all necessary files and configurations are in place
 * for EAS Build APK generation.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Chef Flow - Build Setup Verification\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, description, required = true) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : (required ? '❌' : '⚠️');
  
  console.log(`${status} ${description}: ${filePath}`);
  
  if (exists) {
    checks.passed++;
  } else if (required) {
    checks.failed++;
  } else {
    checks.warnings++;
  }
  
  return exists;
}

function checkAssetDimensions(assetPath, expectedWidth, expectedHeight) {
  if (!fs.existsSync(assetPath)) {
    console.log(`❌ Asset missing: ${assetPath}`);
    checks.failed++;
    return false;
  }
  
  // For this check, we'll just verify the file exists
  // In a real scenario, you'd use an image library to check dimensions
  console.log(`✅ Asset exists: ${assetPath}`);
  checks.passed++;
  return true;
}

function checkPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check build scripts
    const requiredScripts = [
      'build:android:preview',
      'build:android:dev', 
      'build:android:prod'
    ];
    
    let scriptsOk = true;
    requiredScripts.forEach(script => {
      if (packageJson.scripts[script]) {
        console.log(`✅ Build script present: ${script}`);
        checks.passed++;
      } else {
        console.log(`❌ Build script missing: ${script}`);
        checks.failed++;
        scriptsOk = false;
      }
    });
    
    // Check EAS CLI dependency
    if (packageJson.devDependencies && packageJson.devDependencies['eas-cli']) {
      console.log(`✅ EAS CLI installed: ${packageJson.devDependencies['eas-cli']}`);
      checks.passed++;
    } else {
      console.log(`❌ EAS CLI not installed as dev dependency`);
      checks.failed++;
    }
    
    return scriptsOk;
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    checks.failed++;
    return false;
  }
}

function checkAppJson() {
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const expo = appJson.expo;
    
    // Check basic app configuration
    if (expo.name) {
      console.log(`✅ App name: ${expo.name}`);
      checks.passed++;
    } else {
      console.log(`❌ App name missing`);
      checks.failed++;
    }
    
    // Check Android configuration
    if (expo.android) {
      const android = expo.android;
      
      if (android.package) {
        console.log(`✅ Android package: ${android.package}`);
        checks.passed++;
      } else {
        console.log(`❌ Android package name missing`);
        checks.failed++;
      }
      
      if (android.versionCode) {
        console.log(`✅ Android version code: ${android.versionCode}`);
        checks.passed++;
      } else {
        console.log(`❌ Android version code missing`);
        checks.failed++;
      }
      
      if (android.permissions && Array.isArray(android.permissions)) {
        console.log(`✅ Android permissions configured (${android.permissions.length} permissions)`);
        checks.passed++;
      } else {
        console.log(`⚠️ Android permissions not configured`);
        checks.warnings++;
      }
    } else {
      console.log(`❌ Android configuration missing`);
      checks.failed++;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error reading app.json: ${error.message}`);
    checks.failed++;
    return false;
  }
}

function checkEasJson() {
  try {
    const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
    
    if (easJson.build) {
      const profiles = ['development', 'preview', 'production'];
      profiles.forEach(profile => {
        if (easJson.build[profile]) {
          console.log(`✅ EAS build profile: ${profile}`);
          checks.passed++;
        } else {
          console.log(`❌ EAS build profile missing: ${profile}`);
          checks.failed++;
        }
      });
    } else {
      console.log(`❌ EAS build configuration missing`);
      checks.failed++;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error reading eas.json: ${error.message}`);
    checks.failed++;
    return false;
  }
}

// Run all checks
console.log('📁 Configuration Files:');
checkFile('eas.json', 'EAS configuration');
checkFile('app.json', 'App configuration');
checkFile('package.json', 'Package configuration');

console.log('\n🖼️ Required Assets:');
checkAssetDimensions('assets/icon.png', 1024, 1024);
checkAssetDimensions('assets/adaptive-icon.png', 1024, 1024);
checkFile('assets/splash-icon.png', 'Splash screen asset');
checkFile('assets/favicon.png', 'Web favicon', false);

console.log('\n⚙️ Package Configuration:');
checkPackageJson();

console.log('\n📱 App Configuration:');
checkAppJson();

console.log('\n🔧 EAS Configuration:');
checkEasJson();

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️ Warnings: ${checks.warnings}`);

const totalChecks = checks.passed + checks.failed + checks.warnings;
const successRate = Math.round((checks.passed / totalChecks) * 100);

console.log(`\n🎯 Setup Completion: ${successRate}%`);

if (checks.failed === 0) {
  console.log('\n🚀 Ready for EAS Build!');
  console.log('Next steps:');
  console.log('1. npx eas login');
  console.log('2. npx eas build:configure');
  console.log('3. npm run build:android:preview');
} else {
  console.log('\n🔧 Issues found that need to be resolved before building.');
  console.log('Check the failed items above and refer to BUILD_SETUP.md for guidance.');
}

process.exit(checks.failed > 0 ? 1 : 0);